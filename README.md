# Expense Tracker — Backend

Scalable & secure REST API for a mobile-first Expense Tracker. Built with **Express 5**, **TypeScript**, and **MongoDB (Mongoose)**, deployed as a serverless app on **Vercel**.

## Tech Stack

| Concern | Technology |
|---|---|
| Runtime | Node.js (TypeScript, ES2022, NodeNext modules) |
| Framework | Express 5 |
| Database | MongoDB Atlas via Mongoose 9 |
| Auth | JWT (access + refresh tokens), httpOnly cookies, bcrypt password hashing, TOTP-based 2FA |
| Realtime | Ably (pub/sub notifications) |
| File uploads | Multer + Cloudinary |
| Email | Nodemailer (SMTP) |
| Validation | Zod |
| Security | Helmet, CORS, CSRF protection, express-rate-limit |
| Testing | Jest, Supertest, ts-jest |
| Deployment | Vercel serverless functions + Vercel Cron |
| Package manager | pnpm |

## Project Structure

```
backend/
├── api/                    # Vercel serverless entry points
│   ├── index.ts            # Wraps the Express app as a serverless handler
│   └── cron/                # Scheduled cron endpoints (reminders, recurring)
├── src/
│   ├── app.ts               # Express app: security middleware, routes
│   ├── server.ts             # Local dev entrypoint (DB connect + listen)
│   ├── config/                # Environment configuration
│   ├── helpers/                # ApiError, catch-async wrapper, TOTP, response helper
│   ├── middlewares/             # auth, CSRF, rate limiting, error handling, uploads
│   ├── routes/                   # Root API router
│   └── modules/                   # Feature modules (controller/service/model/route/validation per domain)
├── dist/                    # Compiled output (tsc build)
└── vercel.json              # Rewrites + cron schedule for Vercel deployment
```

### Feature Modules

Each module under `src/modules/` follows a consistent `controller → service → model` pattern with Zod-based `validation` schemas:

`account`, `admin` (+ admin-auth), `analytics`, `asset`, `auth`, `bill`, `budget`, `calendar`, `category`, `cron`, `data` (import/export), `debt`, `feedback`, `goal`, `installment`, `investment`, `liability`, `net-worth`, `notification`, `recurring`, `reminder`, `report`, `review`, `saved-filter`, `search`, `transaction`, `transfer`, `user`.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- A MongoDB Atlas connection string
- (Optional) Cloudinary, Ably, and SMTP credentials for full feature support

### Installation

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5005
NODE_ENV=development

# Database
DATABASE_URL=your_mongodb_connection_string

# JWT
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Frontend origin (for CORS)
FRONTEND_URL=http://localhost:3000

# Super admin seed
SUPER_ADMIN_PASSWORD=your_super_admin_password

# Cloudinary (file uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (SMTP)
EMAIL_SENDER_SMTP_HOST=
EMAIL_SENDER_SMTP_PORT=
EMAIL_SENDER_SMTP_USER=
EMAIL_SENDER_SMT_PASS=
EMAIL_SENDER_SMTP_FROM=

# Ably (realtime notifications)
ABLY_API_KEY=

# Vercel cron authorization
CRON_SECRET=
```

> `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` **must** be set to non-default values in production — the app refuses to start otherwise.

### Run in Development

```bash
pnpm dev
```

Starts the server with `tsx watch` on `http://localhost:5005`. On boot it connects to MongoDB, syncs indexes, and seeds the super admin account.

### Build & Run in Production

```bash
pnpm build
pnpm start
```

### Testing

```bash
pnpm test
pnpm test:watch
```

## API

All routes are mounted under `/api/v1` and protected by CSRF middleware. A health check is available at `GET /health`.

Key route groups:

```
/api/v1/auth              # register, OTP verify, login, 2FA, refresh, logout
/api/v1/admin/auth         # admin login
/api/v1/users               # user profile management
/api/v1/accounts             # bank/wallet/cash accounts, credit statements
/api/v1/categories            # expense/income categories
/api/v1/transactions           # income & expense records
/api/v1/transfers               # inter-account transfers
/api/v1/budgets                  # budget planning
/api/v1/goals                     # savings goals
/api/v1/bills                      # recurring bills
/api/v1/debts                       # debt tracking
/api/v1/installments                 # installment plans
/api/v1/investments                   # investment tracking
/api/v1/assets                         # asset tracking
/api/v1/net-worth                       # net worth history
/api/v1/recurring                        # recurring transactions
/api/v1/calendar                          # calendar view of financial events
/api/v1/analytics                          # spending analytics
/api/v1/reports                             # report generation
/api/v1/notifications                        # in-app notifications
/api/v1/search                                # global search
/api/v1/saved-filters                          # saved transaction filters
/api/v1/data                                    # data import/export
/api/v1/reviews                                  # user reviews
/api/v1/feedbacks                                 # user feedback
/api/v1/admin                                      # admin dashboard, user & audit management
/api/v1/cron                                        # cron-triggered jobs
```

## Security

- **Helmet** with a strict Content Security Policy
- **CORS** locked to the configured frontend origin, credentials enabled
- **CSRF protection** on all `/api/v1` routes
- **Rate limiting** on auth, password-reset, and general API traffic
- **JWT** access/refresh tokens stored in httpOnly cookies, with per-user `token_version` for "logout all devices"
- **bcrypt** password hashing
- Optional **TOTP-based 2FA** on login
- Role-based access control for regular users, admins, and super admins

## Deployment

The backend is designed for **Vercel serverless deployment**:

- `api/index.ts` wraps the Express app as a single serverless function (with request-scoped DB connection reuse).
- `vercel.json` rewrites all traffic to that handler and defines two scheduled cron jobs (`/api/cron/reminders`, `/api/cron/recurring`) that run daily.
- Cron endpoints are authorized via the `CRON_SECRET` environment variable.

It can equally be run as a long-lived Node process (`pnpm build && pnpm start`) behind any host, e.g. in a Docker container alongside the frontend.
