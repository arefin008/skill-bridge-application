import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD,
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
      console.log({ user, url, token });
      const info = await transporter.sendMail({
        from: '"Prisma Blog Application" <prisma@gmail.com>',
        to: user.email,
        subject: "Verify your email address",
        html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Verification</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f4f6f8;
        font-family: Arial, Helvetica, sans-serif;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      }
      .header {
        background-color: #4f46e5;
        padding: 20px;
        text-align: center;
        color: #ffffff;
      }
      .content {
        padding: 30px;
        color: #333333;
        line-height: 1.6;
      }
      .content h2 {
        margin-top: 0;
        color: #111827;
      }
      .button-wrapper {
        text-align: center;
        margin: 30px 0;
      }
      .verify-button {
        background-color: #4f46e5;
        color: #ffffff;
        padding: 14px 28px;
        text-decoration: none;
        font-size: 16px;
        border-radius: 6px;
        display: inline-block;
      }
      .verify-button:hover {
        background-color: #4338ca;
      }
      .footer {
        background-color: #f9fafb;
        padding: 20px;
        font-size: 13px;
        color: #6b7280;
        text-align: center;
      }
      .url-text {
        word-break: break-all;
        color: #4f46e5;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Prisma Blog Application</h1>
      </div>

      <div class="content">
        <h2>Verify your email address</h2>

        <p>Hello ${user.name},</p>

        <p>
          Thank you for registering with <strong>Prisma Blog Application</strong>.
          Please confirm your email address by clicking the button below:
        </p>

        <div class="button-wrapper">
          <a
            href="${verificationUrl}"
            target="_blank"
            class="verify-button"
          >
            Verify Email
          </a>
        </div>

        <p>
          If the button doesn’t work, copy and paste the following link into your
          browser:
        </p>

        <p class="url-text">${verificationUrl}</p>

        <p>
          This verification link will expire in 24 hours. If you didn’t create
          an account, you can safely ignore this email.
        </p>

        <p>Best regards,<br />Prisma Blog Team</p>
      </div>

      <div class="footer">
        © 2026 Prisma Blog Application. All rights reserved.
      </div>
    </div>
  </body>
</html>
`,
      });

      console.log("Message sent:", info.messageId);
    },
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
