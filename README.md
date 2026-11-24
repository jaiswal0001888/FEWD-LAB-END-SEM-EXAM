# Northstar — React + Node.js Authentication Starter

A VS Code-ready full-stack authentication example with:
- React + Vite frontend
- Node.js + Express API
- SQLite database
- bcrypt password hashing
- JWT stored in an HttpOnly cookie (not localStorage)
- Register, login, logout, session check, and protected dashboard

## Requirements

- Node.js 20 or newer
- npm
- Visual Studio Code

## Run locally

1. Extract the ZIP file and open the `react-node-auth` folder in VS Code.
2. Open the VS Code terminal (`Terminal` → `New Terminal`).
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create your environment file:

   **Windows PowerShell**
   ```powershell
   Copy-Item .env.example .env
   ```

   **macOS / Linux**
   ```bash
   cp .env.example .env
   ```

5. Open `.env` and replace `JWT_SECRET` with a long random secret (at least 32 characters). Keep `.env` private.
6. Start the frontend and backend:

   ```bash
   npm run dev
   ```

7. Open **http://localhost:5173** in your browser.
8. Register an account, then test the dashboard and sign-out flow.

The API runs at `http://localhost:5000`. SQLite creates its database automatically at `server/data/app.sqlite`.

## Main project structure

```text
react-node-auth/
├── server/
│   ├── data/             # SQLite database is created here
│   ├── auth.js            # JWT cookie and authentication middleware
│   ├── db.js              # SQLite setup
│   └── index.js           # Express API routes
├── src/
│   ├── api.js             # Frontend API requests
│   ├── App.jsx            # Login, register and dashboard screens
│   ├── main.jsx           # React entry point
│   └── styles.css         # UI styles
├── .env.example
├── index.html
├── package.json
└── vite.config.js
```

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/private/overview` | Protected example endpoint |
| GET | `/api/health` | API health check |

## Important security notes

This is a learning starter, not a production-ready identity platform. Before production:
- Use HTTPS and set `NODE_ENV=production`.
- Use a strong, unique `JWT_SECRET` stored in your hosting provider's secret manager.
- Add rate limiting to authentication endpoints, email verification, password reset, and monitoring.
- Review CSRF protection and cookie settings for your exact deployment/domain setup.
- Add account lockout or abuse controls where appropriate.
- Keep dependencies updated and never commit `.env` or the SQLite database.
- For production systems, consider a maintained authentication provider or a thoroughly reviewed session-management design.

Passwords are hashed with bcrypt before storage. The password hash is never returned by the API.
