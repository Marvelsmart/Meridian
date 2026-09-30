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
ADMIN_EMAIL=your-separate-admin-gmail@gmail.com
ADMIN_PASSWORD=choose-a-strong-password-at-least-12-characters
RESEND_API_KEY=re_...
EMAIL_FROM=Northstar Support <support@your-verified-domain.example>
CLIENT_ORIGIN=https://your-project.vercel.app
VITE_API_URL=
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to the separate administrator email and a unique password of at least 12 characters. On the first admin sign-in at `/admin`, the backend creates or updates that MongoDB user and stores only a bcrypt password hash. These variables are server-only; do not prefix them with `VITE_`. Do not use customer signup for the admin account; the configured admin email is reserved from customer registration.

Configure Resend with a verified sending domain for password recovery and staff-triggered PIN reset links. Reset codes are short-lived, single-use, stored hashed, and never returned by the API.

Customer support conversations are stored in MongoDB and shared between each signed-in customer's chat panel and the admin inbox. Both sides poll for replies, and conversation history remains available for follow-up. No third-party messaging credentials are required.

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