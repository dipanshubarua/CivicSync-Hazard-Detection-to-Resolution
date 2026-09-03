# vitc_hackathon_phase3

# ⚡ CivicSync Pro — Intelligent Civic Triage

CivicSync is a citizen-to-government civic issue reporting platform. Citizens report hazards (potholes, broken streetlights, garbage, etc.) via text, voice, or photo, in any of eight Indian languages. An AI model grades severity, merges duplicate reports from nearby citizens, and holds the responsible municipal department to a visible SLA countdown until the issue is resolved.

The project is a Firebase-backed web app split across four standalone HTML files, with a small server component used to keep private API credentials out of the browser and out of the public repository.

---

## ✨ Features

* **Multi-modal reporting** — type, speak, or photograph an incident.
* **8-language support** — voice input, ticket storage, and status wording all follow the selected language.
* **AI severity triage** — Gemini grades each report's severity from the description and photo. If Gemini is unavailable, the app falls back to an offline keyword-based severity engine.
* **Duplicate clustering** — nearby reports of the same issue are merged instead of creating duplicate tickets.
* **SLA countdown** — every ticket carries a live countdown clock that flags overdue departments.
* **Live map reporting** — citizens drop a pin on a Leaflet map when filing a report.
* **City transparency dashboard** — a public heatmap + stats view of civic issues.
* **Citizen dashboard** — track your own tickets, see a before/after "wipe" photo comparison once resolved, and earn Civic Score points/rank.
* **Authority portal** — authenticated command center for municipal officers to manage and resolve tickets.
* **Public ticket tracking** — anyone with a ticket ID can check status without logging in.

---

## 🗂️ File Structure

| File             | Purpose                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| `index.html`     | Main citizen-facing app: login/signup, overview, map-based issue reporting, and the citizen dashboard. |
| `dashboard.html` | Public City Transparency Dashboard — heatmap and city-wide stats, no login required.                   |
| `authority.html` | Authenticated portal for municipal officers to triage and resolve tickets.                             |
| `track.html`     | Standalone page for tracking a single complaint by ticket ID.                                          |
| `server.mjs`     | Small backend that serves the app and keeps the Gemini API key server-side.                            |
| `.env.example`   | Example environment-variable configuration. Contains placeholders only.                                |
| `.gitignore`     | Prevents local secrets such as `.env` from being committed.                                            |
| `package.json`   | Defines the local server/start command.                                                                |

---

## 🛠️ Tech Stack

* **Tailwind CSS** (via CDN) for styling
* **Leaflet.js** + **Leaflet.heat** for maps and heatmaps
* **Firebase** (Auth + Firestore) for accounts, sessions, and real-time ticket data
* **Google Gemini API** for AI-based severity scoring and image analysis
* **Node.js** server for keeping the Gemini API credential private

The front-end remains lightweight, but the Gemini credential is **not stored in any HTML file or public JavaScript code**.

---

## 🔐 Security / API Keys

### Firebase

The Firebase web configuration used by the browser is **not treated as a secret credential**. Firebase client configuration can be included in the front end, but the Firebase project must be protected with appropriate **Authentication** and **Firestore Security Rules**.

Do not place Firebase Admin SDK credentials, service-account JSON files, or other server-side Firebase secrets in this repository.

### Gemini API Key

**Never put a real Gemini API key in `index.html`, `dashboard.html`, `authority.html`, `track.html`, or any other client-side file.**

The Gemini key is stored only in the server environment:

```env
GEMINI_API_KEY=your_private_gemini_api_key_here
```

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Then add your own private Gemini API key to `.env`.

The `.env` file is ignored by Git through `.gitignore` and **must never be committed to GitHub**.

The browser calls the local server instead of sending the Gemini credential directly from client-side code.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd vitc_hackathon_phase3
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and add your private Gemini API key:

```env
GEMINI_API_KEY=your_private_gemini_api_key_here
```

Do **not** replace the placeholder in the README with a real key.

### 4. Firebase configuration

The application uses Firebase Authentication and Firestore.

Before deploying your own copy, make sure your Firebase project has:

* **Email/Password Authentication** enabled.
* **Firestore** enabled.
* Appropriate **Firestore Security Rules** configured for your application.

Never commit Firebase Admin credentials or service-account files.

### 5. Start the application

```bash
npm start
```

Then open the local address shown by the server and use:

```text
index.html
```

as the main citizen entry point.

---

## 🤖 Gemini AI

Gemini-powered severity scoring and photo analysis require the server-side `GEMINI_API_KEY`.

When the key is unavailable or Gemini cannot be reached, CivicSync uses its built-in offline keyword-based fallback engine instead.

The API key should therefore exist **only in the server environment**, not in the source code.

For production deployment, configure `GEMINI_API_KEY` using your hosting provider's environment-variable/secret-management system rather than committing it to the repository.

---

## 🔐 Authority Portal Access

The authority portal does **not** publish an administrator email address or password in the repository.

Officer authentication is handled through Firebase Authentication.

Create/configure the officer account in the Firebase project and use those credentials to sign in through `authority.html`.

**Do not add administrator passwords, access tokens, or other credentials to the HTML files, README, screenshots, source code, or Git history.**

If credentials were ever previously committed to a public repository, treat them as compromised and rotate/revoke them before publishing the repository again.

---

## 🌐 Running Without Gemini

Gemini is optional.

If `GEMINI_API_KEY` is missing or unavailable, the application can continue using its offline keyword-based severity fallback where supported.

This means the application can still be demonstrated without publishing an API key.

---

## 📦 Public Repository Checklist

Before pushing the project to GitHub, verify that:

```text
.env
*.key
*.pem
service-account*.json
credentials*.json
```

and any other secret files are excluded by `.gitignore`.

Also search the repository for accidental secrets:

```bash
git grep -n "AIza"
git grep -n "GEMINI_API_KEY"
git grep -n "password"
git grep -n "secret"
```

Do not commit any real API key, password, access token, private key, or service-account credential.

---

## 📁 Recommended Repository Structure

```text
vitc_hackathon_phase3/
├── index.html
├── dashboard.html
├── authority.html
├── track.html
├── server.mjs
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

The actual `.env` file should remain local and should **not** be included in the repository:

```text
.env
```
