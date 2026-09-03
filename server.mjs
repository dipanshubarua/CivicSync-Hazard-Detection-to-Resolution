import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';

function loadDotEnv() {
  const envPath = path.join(ROOT, '.env');
  return readFile(envPath, 'utf8')
    .then(text => {
      for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = value;
      }
    })
    .catch(() => {});
}

await loadDotEnv();

function json(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(data);
}

async function readJson(req, limitBytes = 12 * 1024 * 1024) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > limitBytes) throw Object.assign(new Error('Request too large.'), { statusCode: 413 });
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString('utf8');
  return JSON.parse(text || '{}');
}

function firebaseConfig() {
  const required = [
    'FIREBASE_API_KEY',
    'FIREBASE_AUTH_DOMAIN',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'FIREBASE_MESSAGING_SENDER_ID',
    'FIREBASE_APP_ID'
  ];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`);
  return {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/config' && req.method === 'GET') {
    try {
      return json(res, 200, {
        firebaseConfig: firebaseConfig(),
        geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash'
      });
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  if (url.pathname === '/api/gemini' && req.method === 'POST') {
    if (!process.env.GEMINI_API_KEY) {
      return json(res, 503, { error: 'Gemini is not configured on the server.' });
    }
    let payload;
    try {
      payload = await readJson(req);
    } catch (err) {
      return json(res, err.statusCode || 400, { error: 'Invalid JSON request.' });
    }

    if (!payload || !Array.isArray(payload.contents)) {
      return json(res, 400, { error: 'Invalid Gemini request payload.' });
    }

    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    try {
      const upstream = await fetch(`${endpoint}?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: payload.contents,
          generationConfig: payload.generationConfig || {}
        })
      });

      const text = await upstream.text();
      res.writeHead(upstream.status, {
        'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff'
      });
      return res.end(text);
    } catch (err) {
      return json(res, 502, { error: 'Gemini upstream request failed.' });
    }
  }

  return json(res, 404, { error: 'Not found.' });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

async function serveStatic(req, res, url) {
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';

  const candidate = path.resolve(ROOT, `.${pathname}`);
  if (!candidate.startsWith(ROOT + path.sep) && candidate !== ROOT) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  try {
    const info = await stat(candidate);
    if (!info.isFile()) throw new Error('Not a file');
    const ext = path.extname(candidate).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    });
    createReadStream(candidate).pipe(res);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      return await handleApi(req, res, url);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { 'Allow': 'GET, HEAD' });
      return res.end('Method not allowed');
    }
    return await serveStatic(req, res, url);
  } catch {
    json(res, 500, { error: 'Internal server error.' });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`CivicSync running at http://localhost:${PORT}`);
});
