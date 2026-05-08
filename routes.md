# Primadex Authentication & Security Guide

This guide details the Google Authentication and Route Protection system implemented for the Primadex platform.

## 1. Technology Stack
- **Framework**: Auth.js (NextAuth v5 Beta)
- **Provider**: Google OAuth
- **Protection**: Next.js 16 Proxy Middleware

## 2. Configuration (`.env.local`)
To activate the system, the following environment variables must be configured:

| Variable | Description |
| :--- | :--- |
| `AUTH_SECRET` | A random 32-character string for session encryption. |
| `GOOGLE_CLIENT_ID` | Obtained from Google Cloud Console. |
| `GOOGLE_CLIENT_SECRET` | Obtained from Google Cloud Console. |
| `ADMIN_EMAILS` | Comma-separated list of emails allowed to access `/admin`. |
| `NEXTAUTH_URL` | Set to `http://localhost:3000` for local dev. |

---

## 3. Route Security Architecture

We use a centralized `proxy.ts` (the new Next.js 16 convention) to manage access.

### Public Routes (No Login Required)
- `/*` (Homepage)
- `/products/*` (Marketplace & Detail Pages)
- `/api/products` (Product Listing API)

### Protected Routes (Login Required)
- `/checkout/*` (User must be logged in to purchase or subscribe)

### Admin Routes (Login + Admin Email Required)
- `/admin/*` (Dashboard, Add Asset, AI Analysis)

---

## 4. Next.js 16 Proxy Convention
In this project's version of Next.js (**16.2.5**), the standard `middleware.ts` has been replaced by **`proxy.ts`**. 

- **File**: `d:\CrossEye startup\3dmp\primadex\proxy.ts`
- **Logic**: It exports a `proxy` function that wraps the `auth` handler. This ensures that every request is checked for a session before reaching sensitive pages.

---

## 5. Google Cloud Console Setup
To enable logins, follow these steps:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project named **Primadex**.
3. Configure the **OAuth Consent Screen** (Internal or External).
4. Go to **Credentials** -> **Create Credentials** -> **OAuth Client ID**.
5. Application Type: **Web Application**.
6. Authorized Redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
7. Copy the **Client ID** and **Client Secret** into your `.env.local`.

---

## 6. Development Workflow
If you encounter a "Both middleware and proxy file detected" error after a build:
1. Stop the server.
2. Run `rm -r .next` (Clear cache).
3. Run `npm run dev`.
