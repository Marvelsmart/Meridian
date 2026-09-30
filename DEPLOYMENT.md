# Deployment

## GitHub and Vercel

This project deploys as one Vercel application:

- Vite serves the React frontend.
- `api/handler.js` serves the Express REST API.
- MongoDB Atlas remains the persistent database.

The repository declares `npm install`, `npm run build`, and `./dist` as the Vercel build settings. In the Vercel dashboard, set the project Root Directory to `./` (the repository root) and remove any override that uses `server`, `server/index.js`, or `npm run server` as the build/output setting. `npm run server` is only for local development; Vercel uses `api/handler.js` for the backend function.

Add these variables in Vercel Project Settings for Production, Preview, and Development as appropriate:

```env
MONGODB_URI=mongodb://...
JWT_SECRET=long-random-secret
BANK_MANAGER_CODE=manager-code
ADMIN_EMAILS=admin@example.com
RESEND_API_KEY=re_...
EMAIL_FROM=Northstar Support <support@your-verified-domain.example>
CLIENT_ORIGIN=https://your-project.vercel.app
VITE_API_URL=
```

`ADMIN_EMAILS` is a comma-separated allowlist of existing account emails permitted to use the administration page. Keep it server-only; do not prefix it with `VITE_`. The matching account must be registered before the admin page can be used.

Configure Resend with a verified sending domain for password recovery and staff-triggered PIN reset links. Reset codes are short-lived, single-use, stored hashed, and never returned by the API.

The Zangi number is configured in `src/config/support.js`. The in-app panel does not redirect to Zangi, but live message delivery requires a Zangi messaging/API integration and server-side credentials; the number by itself cannot provide that connection.

Leave `VITE_API_URL` empty when frontend and API are deployed together. The frontend then calls same-origin `/api` routes.

In MongoDB Atlas, allow the Vercel deployment to connect through the network access settings and use a restricted database user. Do not commit `.env`; it is ignored by Git.

## Local development

Create `.env` from `.env.example`, set the real values locally, then run:

```powershell
npm run server
npm run dev
```

The Vite development proxy forwards `/api` to `http://127.0.0.1:4000`.

## Seeding

Seeding is a manual operation. Set `SEED_PASSWORD` in the process environment and run `npm run seed` once against the intended Atlas database. Never put that password in source control.