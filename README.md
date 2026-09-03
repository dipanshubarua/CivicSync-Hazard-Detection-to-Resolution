# CivicSync-Hazard-Detection-to-Resolution
# ⚡ CivicSync Pro — Intelligent Civic Triage

CivicSync is a citizen-to-government civic issue reporting platform. Citizens report hazards (potholes, broken streetlights, garbage, etc.) via text, voice, or photo, in any of eight Indian languages. An AI model grades severity, merges duplicate reports from nearby citizens, and holds the responsible municipal department to a visible SLA countdown until the issue is resolved.

The project is a static, front-end-only web app (Firebase-backed) split across four standalone HTML files.

---

## ✨ Features

- **Multi-modal reporting** — type, speak, or photograph an incident.
- **8-language support** — voice input, ticket storage, and status wording all follow the selected language.
- **AI severity triage** — Gemini grades each report's severity from the description and photo (falls back to an offline keyword engine if no API key is set).
- **Duplicate clustering** — nearby reports of the same issue are merged instead of creating duplicate tickets.
- **SLA countdown** — every ticket carries a live countdown clock that flags overdue departments.
- **Live map reporting** — citizens drop a pin on a Leaflet map when filing a report.
- **City transparency dashboard** — a public heatmap + stats view of all civic issues.
- **Citizen dashboard** — track your own tickets, see a before/after "wipe" photo comparison once resolved, and earn Civic Score points/rank.
- **Authority portal** — a password-gated command center for municipal officers to manage and resolve tickets.
- **Public ticket tracking** — anyone with a ticket ID can check status without logging in.

---

## 🗂️ File Structure

| File | Purpose |
|---|---|
| `index.html` | Main citizen-facing app: login/signup, overview, map-based issue reporting, and the citizen dashboard. |
| `dashboard.html` | Public City Transparency Dashboard — heatmap and city-wide stats, no login required. |
| `authority.html` | Password-protected portal for municipal officers to triage and resolve tickets. |
| `track.html` | Standalone page for tracking a single complaint by ticket ID. |

---

## 🛠️ Tech Stack

- **Tailwind CSS** (via CDN) for styling
- **Leaflet.js** + **Leaflet.heat** for maps and heatmaps
- **Firebase** (Auth + Firestore) for accounts, sessions, and real-time ticket data
- **Google Gemini API** for AI-based severity scoring (optional — offline keyword fallback included)

No build step or package manager is required — every file runs as-is in a browser.

---

## 🚀 Getting Started

1. **Clone/download** the four HTML files into one folder (they link to each other by relative path, so keep them together).
2. **Firebase**: the project already ships with a configured Firebase project (`civicsync-69010`) wired into each file's `firebaseConfig`. If you want to point this at your own Firebase project instead, replace the `firebaseConfig` object near the top of the `<script type="module">` block in each of the four files, and enable **Email/Password Auth** + **Firestore** in that project.
3. **Gemini API key (optional)**: each file has a `GEMINI_API_KEY` constant currently set to a placeholder:
   ```js
   const GEMINI_API_KEY = "something-something";
   ```
   Get a free key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) and paste it into **all four files** to enable AI severity scoring and photo grading. Without it, the app silently falls back to an offline keyword-based severity engine (a console warning notes this on load).
4. **Serve the files.** Because the app uses ES module imports, open it via a local server rather than `file://`, e.g.:
   ```bash
   npx serve .
   # or
   python3 -m http.server 8000
   ```
5. Open `index.html` in your browser to start as a citizen, or `authority.html` to access the officer portal.

---

## 🔐 Authority Portal Access

`authority.html` is gated behind a login screen and can **only** be accessed with the following credentials:

| Field | Value |
|---|---|
| **Email** | `admin@gov.in` |
| **Password** | `GovAdmin2026!` |

These are hardcoded in `authority.html` as `AUTHORITY_EMAIL` / `AUTHORITY_PASSWORD`. 

---

