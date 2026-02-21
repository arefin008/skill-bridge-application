# ⚙️ SkillBridge API

**The robust core powering the SkillBridge educational marketplace.**

The SkillBridge backend is a high-performance Express & Prisma-based API designed to handle complex role-based authentication, real-time data persistence, and professional email automation.

---

## 🛠️ Architecture & Tech Stack

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
DATABASE_URL="your_postgresql_url"

# Authentication
BETTER_AUTH_SECRET="your_secret"
BETTER_AUTH_URL="https://YOUR_FRONTEND.vercel.app/api/auth"

# Origins
APP_URL="https://YOUR_FRONTEND.vercel.app"

# Email (SMTP)
APP_USER="your_email"
APP_PASSWORD="your_app_password"
```

### 3. Run Locally

```bash
# Install dependencies
pnpm install

# Run migrations
npx prisma migrate dev

# Start development server
pnpm dev
```

---

## 📄 Platform Features

- **Tutor Profile Management**: API endpoints for professional bio and availability.
- **Review System**: Validated review logic (only allows reviews for completed bookings).
- **Admin Gateway**: Secure endpoints for platform-wide user auditing.

---

**Built by [Arefin Rounok](https://github.com/arefin008)**
