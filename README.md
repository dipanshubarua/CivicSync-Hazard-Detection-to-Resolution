# CivicSync — public-safe build

This version preserves the four existing pages and moves secrets out of the browser bundle.

## What changed

- `GEMINI_API_KEY` is no longer stored in any HTML file. Browser requests go to the same-origin `/api/gemini` proxy, which reads the key from server environment.
- The Firebase web API key and other Firebase browser configuration are supplied at runtime by `/api/config`, so no `AIza...` value is committed to the repository.
- The authority portal no longer contains the officer password. Authority login uses Firebase Authentication for `admin@gov.in`.
- The existing keyword fallback remains in place when Gemini is unavailable.
- The UI, page names, routes, Firestore collection usage, and existing front-end flow are otherwise left intact.

## Setup

1. Install Node.js 18.18+.
2. Copy `.env.example` to `.env`.
3. Fill in your Firebase web configuration values and a real `GEMINI_API_KEY`.
4. In Firebase Authentication, create/enable the authority account `admin@gov.in` and set its password there. The password is never put in this repository.
5. Run:

```bash
npm start
```

6. Open `http://localhost:3000`.

## Important for public deployment

The Firebase web API key is not a secret in a Firebase web app; it is delivered to the browser. Keep it protected with the appropriate API-key/application restrictions and Firebase rules. The Gemini key **is** a server-side secret and must stay only in the deployment environment.

Do not open the HTML files directly with `file://`; use the Node server so `/api/config` and `/api/gemini` are available.

## Files

- `index.html` — citizen reporting
- `track.html` — ticket tracking
- `dashboard.html` — public transparency dashboard
- `authority.html` — officer portal
- `server.mjs` — runtime config + Gemini proxy + static server
- `.env.example` — safe template, no real secret
- `.gitignore` — excludes `.env`
