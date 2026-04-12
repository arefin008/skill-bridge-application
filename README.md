# SkillBridge API

Backend for the SkillBridge tutoring marketplace. The project now supports a 5-role system across auth, moderation, support, booking, tutor management, and admin operations.

## Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM**: [Prisma](https://www.prisma.io/) with PostgreSQL
- **Authentication**: [Better-Auth](https://www.better-auth.com/) (Node Handler)
- **Email Service**: Transporter-based SMTP (Nodemailer)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🛡️ Authentication Architecture

The API implements a **Unified Domain Strategy** for authentication, ensuring that session cookies remain valid across frontend and backend origins.

- **Proxy Rewrite Friendly**: Configured to work seamlessly with Next.js rewrites.
- **Cross-Domain Security**: Strictly enforces `secure: true` and `sameSite: "none"` for production cookies.
- **Role-Based Access Control**: Hardcoded roles for `ADMIN`, `TUTOR`, and `STUDENT`.

---

## 🚀 Getting Started

### 1. Database Setup

Ensure you have a PostgreSQL database ready (Neon.tech is recommended for production).

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=verify-full"
BETTER_AUTH_SECRET="your_secret"
APP_URL="https://YOUR_FRONTEND.vercel.app"
APP_USER="your_email"
APP_PASSWORD="your_app_password"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

Use `sslmode=verify-full` for hosted PostgreSQL URLs so `pg` does not fall back to the deprecated `sslmode=require` alias behavior.

## Route Reference

See `routes.md` for the current API surface.
