var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/app.ts
import express6 from "express";
import { toNodeHandler } from "better-auth/node";

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.3.0",
  "engineVersion": "9d6ad21cbbceab97458517b147a6a09ff43aa735",
  "activeProvider": "postgresql",
  "inlineSchema": 'model User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(false)\n  image         String?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  role          String?   @default("USER")\n  phone         String?\n  status        String?   @default("ACTIVE")\n  sessions      Session[]\n  accounts      Account[]\n\n  // SkillBridge relations\n  tutorProfile    TutorProfile?\n  studentBookings Booking[]     @relation("StudentBookings")\n  reviews         Review[]\n\n  @@unique([email])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Availability {\n  id             String  @id @default(uuid())\n  tutorProfileId String\n  dayOfWeek      Int // 0 = Sunday, 6 = Saturday\n  startTime      String // "14:00"\n  endTime        String // "16:00"\n  isBooked       Boolean @default(false)\n\n  tutor   TutorProfile @relation(fields: [tutorProfileId], references: [id])\n  booking Booking?\n\n  createdAt DateTime @default(now())\n}\n\nmodel Booking {\n  id             String        @id @default(uuid())\n  studentId      String\n  tutorProfileId String\n  categoryId     String\n  availabilityId String?       @unique\n  sessionDate    DateTime\n  startTime      String\n  endTime        String\n  status         BookingStatus @default(CONFIRMED)\n\n  student      User          @relation("StudentBookings", fields: [studentId], references: [id])\n  tutor        TutorProfile  @relation(fields: [tutorProfileId], references: [id])\n  category     Category      @relation(fields: [categoryId], references: [id])\n  availability Availability? @relation(fields: [availabilityId], references: [id])\n  review       Review?\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nenum BookingStatus {\n  CONFIRMED\n  COMPLETED\n  CANCELLED\n}\n\nmodel Category {\n  id       String  @id @default(uuid())\n  name     String  @unique\n  isActive Boolean @default(true)\n\n  bookings        Booking[]\n  tutorCategories TutorCategory[]\n}\n\nmodel TutorCategory {\n  id             String @id @default(uuid())\n  tutorProfileId String\n  categoryId     String\n\n  tutor    TutorProfile @relation(fields: [tutorProfileId], references: [id])\n  category Category     @relation(fields: [categoryId], references: [id])\n\n  @@unique([tutorProfileId, categoryId])\n}\n\nmodel Review {\n  id             String  @id @default(uuid())\n  bookingId      String  @unique\n  studentId      String\n  tutorProfileId String\n  rating         Int\n  comment        String?\n\n  booking Booking      @relation(fields: [bookingId], references: [id])\n  student User         @relation(fields: [studentId], references: [id])\n  tutor   TutorProfile @relation(fields: [tutorProfileId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel TutorProfile {\n  id           String  @id @default(uuid())\n  userId       String  @unique\n  bio          String\n  hourlyRate   Float\n  experience   Int\n  avgRating    Float   @default(0)\n  totalReviews Int     @default(0)\n  isVerified   Boolean @default(false)\n\n  user            User            @relation(fields: [userId], references: [id])\n  bookings        Booking[]\n  reviews         Review[]\n  availability    Availability[]\n  tutorCategories TutorCategory[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"scalar","type":"String"},{"name":"phone","kind":"scalar","type":"String"},{"name":"status","kind":"scalar","type":"String"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"studentBookings","kind":"object","type":"Booking","relationName":"StudentBookings"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Availability":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"dayOfWeek","kind":"scalar","type":"Int"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"isBooked","kind":"scalar","type":"Boolean"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"AvailabilityToTutorProfile"},{"name":"booking","kind":"object","type":"Booking","relationName":"AvailabilityToBooking"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"availabilityId","kind":"scalar","type":"String"},{"name":"sessionDate","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"student","kind":"object","type":"User","relationName":"StudentBookings"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"BookingToTutorProfile"},{"name":"category","kind":"object","type":"Category","relationName":"BookingToCategory"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToBooking"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToCategory"},{"name":"tutorCategories","kind":"object","type":"TutorCategory","relationName":"CategoryToTutorCategory"}],"dbName":null},"TutorCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"TutorCategoryToTutorProfile"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToTutorCategory"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"},{"name":"student","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"ReviewToTutorProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Float"},{"name":"experience","kind":"scalar","type":"Int"},{"name":"avgRating","kind":"scalar","type":"Float"},{"name":"totalReviews","kind":"scalar","type":"Int"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToTutorProfile"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToTutorProfile"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToTutorProfile"},{"name":"tutorCategories","kind":"object","type":"TutorCategory","relationName":"TutorCategoryToTutorProfile"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer: Buffer2 } = await import("buffer");
  const wasmArray = Buffer2.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// generated/prisma/internal/prismaNamespace.ts
var prismaNamespace_exports = {};
__export(prismaNamespace_exports, {
  AccountScalarFieldEnum: () => AccountScalarFieldEnum,
  AnyNull: () => AnyNull2,
  AvailabilityScalarFieldEnum: () => AvailabilityScalarFieldEnum,
  BookingScalarFieldEnum: () => BookingScalarFieldEnum,
  CategoryScalarFieldEnum: () => CategoryScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  ModelName: () => ModelName,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  TransactionIsolationLevel: () => TransactionIsolationLevel,
  TutorCategoryScalarFieldEnum: () => TutorCategoryScalarFieldEnum,
  TutorProfileScalarFieldEnum: () => TutorProfileScalarFieldEnum,
  UserScalarFieldEnum: () => UserScalarFieldEnum,
  VerificationScalarFieldEnum: () => VerificationScalarFieldEnum,
  defineExtension: () => defineExtension,
  empty: () => empty2,
  getExtensionContext: () => getExtensionContext,
  join: () => join2,
  prismaVersion: () => prismaVersion,
  raw: () => raw2,
  sql: () => sql
});
import * as runtime2 from "@prisma/client/runtime/client";
var PrismaClientKnownRequestError2 = runtime2.PrismaClientKnownRequestError;
var PrismaClientUnknownRequestError2 = runtime2.PrismaClientUnknownRequestError;
var PrismaClientRustPanicError2 = runtime2.PrismaClientRustPanicError;
var PrismaClientInitializationError2 = runtime2.PrismaClientInitializationError;
var PrismaClientValidationError2 = runtime2.PrismaClientValidationError;
var sql = runtime2.sqltag;
var empty2 = runtime2.empty;
var join2 = runtime2.join;
var raw2 = runtime2.raw;
var Sql2 = runtime2.Sql;
var Decimal2 = runtime2.Decimal;
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var prismaVersion = {
  client: "7.3.0",
  engine: "9d6ad21cbbceab97458517b147a6a09ff43aa735"
};
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var DbNull2 = runtime2.DbNull;
var JsonNull2 = runtime2.JsonNull;
var AnyNull2 = runtime2.AnyNull;
var ModelName = {
  User: "User",
  Session: "Session",
  Account: "Account",
  Verification: "Verification",
  Availability: "Availability",
  Booking: "Booking",
  Category: "Category",
  TutorCategory: "TutorCategory",
  Review: "Review",
  TutorProfile: "TutorProfile"
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var UserScalarFieldEnum = {
  id: "id",
  name: "name",
  email: "email",
  emailVerified: "emailVerified",
  image: "image",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  role: "role",
  phone: "phone",
  status: "status"
};
var SessionScalarFieldEnum = {
  id: "id",
  expiresAt: "expiresAt",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  ipAddress: "ipAddress",
  userAgent: "userAgent",
  userId: "userId"
};
var AccountScalarFieldEnum = {
  id: "id",
  accountId: "accountId",
  providerId: "providerId",
  userId: "userId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  idToken: "idToken",
  accessTokenExpiresAt: "accessTokenExpiresAt",
  refreshTokenExpiresAt: "refreshTokenExpiresAt",
  scope: "scope",
  password: "password",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var VerificationScalarFieldEnum = {
  id: "id",
  identifier: "identifier",
  value: "value",
  expiresAt: "expiresAt",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var AvailabilityScalarFieldEnum = {
  id: "id",
  tutorProfileId: "tutorProfileId",
  dayOfWeek: "dayOfWeek",
  startTime: "startTime",
  endTime: "endTime",
  isBooked: "isBooked",
  createdAt: "createdAt"
};
var BookingScalarFieldEnum = {
  id: "id",
  studentId: "studentId",
  tutorProfileId: "tutorProfileId",
  categoryId: "categoryId",
  availabilityId: "availabilityId",
  sessionDate: "sessionDate",
  startTime: "startTime",
  endTime: "endTime",
  status: "status",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var CategoryScalarFieldEnum = {
  id: "id",
  name: "name",
  isActive: "isActive"
};
var TutorCategoryScalarFieldEnum = {
  id: "id",
  tutorProfileId: "tutorProfileId",
  categoryId: "categoryId"
};
var ReviewScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  studentId: "studentId",
  tutorProfileId: "tutorProfileId",
  rating: "rating",
  comment: "comment",
  createdAt: "createdAt"
};
var TutorProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  bio: "bio",
  hourlyRate: "hourlyRate",
  experience: "experience",
  avgRating: "avgRating",
  totalReviews: "totalReviews",
  isVerified: "isVerified",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var SortOrder = {
  asc: "asc",
  desc: "desc"
};
var QueryMode = {
  default: "default",
  insensitive: "insensitive"
};
var NullsOrder = {
  first: "first",
  last: "last"
};
var defineExtension = runtime2.Extensions.defineExtension;

// generated/prisma/enums.ts
var BookingStatus = {
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
import nodemailer from "nodemailer";
var transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASSWORD
  }
});
var auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  trustedOrigins: [process.env.APP_URL],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
        required: false
      },
      phone: {
        type: "string",
        required: false
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true
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
          If the button doesn\u2019t work, copy and paste the following link into your
          browser:
        </p>

        <p class="url-text">${verificationUrl}</p>

        <p>
          This verification link will expire in 24 hours. If you didn\u2019t create
          an account, you can safely ignore this email.
        </p>

        <p>Best regards,<br />Prisma Blog Team</p>
      </div>

      <div class="footer">
        \xA9 2026 Prisma Blog Application. All rights reserved.
      </div>
    </div>
  </body>
</html>
`
      });
      console.log("Message sent:", info.messageId);
    }
  },
  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType: "offline",
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }
  }
});

// src/app.ts
import cors from "cors";

// src/middlewares/notFound.ts
function notFound(req, res) {
  res.status(404).json({
    message: "Route not found!",
    path: req.originalUrl,
    date: Date()
  });
}

// src/middlewares/globalErrorHandler.ts
function errorHandler(err, req, res, next) {
  let statusCode = 500;
  let errorMessage = "Internal Server Error";
  let errorDetails = err;
  if (err instanceof prismaNamespace_exports.PrismaClientValidationError) {
    statusCode = 400;
    errorMessage = "You provide incorrect field type or missing fields!";
  } else if (err instanceof prismaNamespace_exports.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      statusCode = 400;
      errorMessage = "An operation failed because it depends on one or more records that were required but not found.";
    } else if (err.code === "P2002") {
      statusCode = 400;
      errorMessage = "Duplicate key error";
    } else if (err.code === "P2003") {
      statusCode = 400;
      errorMessage = "Foreign key constraint failed";
    }
  } else if (err instanceof prismaNamespace_exports.PrismaClientUnknownRequestError) {
    statusCode = 500;
    errorMessage = "Error occurred during query execution";
  } else if (err instanceof prismaNamespace_exports.PrismaClientInitializationError) {
    if (err.errorCode === "P1000") {
      statusCode = 401;
      errorMessage = "Authentication failed. Please check your creditials!";
    } else if (err.errorCode === "P1001") {
      statusCode = 400;
      errorMessage = "Can't reach database server";
    }
  }
  res.status(statusCode);
  res.json({
    message: errorMessage,
    error: errorDetails
  });
}
var globalErrorHandler_default = errorHandler;

// src/modules/tutor/tutor.routes.ts
import express from "express";

// src/modules/tutor/tutor.service.ts
var createProfile = async (userId, data) => {
  return await prisma.tutorProfile.create({
    data: {
      ...data,
      userId
    }
  });
};
var getProfileByUserId = async (userId) => {
  return await prisma.tutorProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      tutorCategories: { include: { category: true } },
      availability: true,
      reviews: true
    }
  });
};
var getAllTutors = async (filters) => {
  const { subject, minRating, minPrice, maxPrice } = filters;
  const where = {};
  if (minPrice !== void 0 || maxPrice !== void 0) {
    where.hourlyRate = {};
    if (minPrice !== void 0) where.hourlyRate.gte = Number(minPrice);
    if (maxPrice !== void 0) where.hourlyRate.lte = Number(maxPrice);
    if (Object.keys(where.hourlyRate).length === 0) delete where.hourlyRate;
  }
  if (minRating !== void 0) {
    where.avgRating = { gte: Number(minRating) };
  }
  if (subject) {
    where.tutorCategories = {
      some: {
        category: {
          name: {
            contains: subject,
            mode: "insensitive"
          }
        }
      }
    };
  }
  const tutors = await prisma.tutorProfile.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      tutorCategories: { include: { category: true } },
      availability: { where: { isBooked: false } },
      reviews: true
    },
    orderBy: { avgRating: "desc" }
  });
  return tutors;
};
var getTutorById = async (id) => {
  return await prisma.tutorProfile.findUnique({
    where: { id },
    include: {
      user: true,
      tutorCategories: { include: { category: true } },
      availability: true,
      reviews: true
    }
  });
};
var updateProfile = async (userId, data) => {
  const existingProfile = await prisma.tutorProfile.findUnique({
    where: { userId }
  });
  if (!existingProfile) return null;
  return await prisma.tutorProfile.update({
    where: { id: existingProfile.id },
    data: {
      bio: data.bio ?? existingProfile.bio,
      hourlyRate: data.hourlyRate ?? existingProfile.hourlyRate,
      experience: data.experience ?? existingProfile.experience,
      updatedAt: /* @__PURE__ */ new Date()
    }
  });
};
var tutorService = {
  createProfile,
  getProfileByUserId,
  updateProfile,
  getAllTutors,
  getTutorById
};

// src/modules/tutor/tutor.controller.ts
var createTutorProfile = async (req, res, next) => {
  try {
    const user = req.user;
    console.log(user);
    const { bio, hourlyRate, experience } = req.body;
    if (!user) {
      return res.status(400).json({
        error: "User information is missing (Unauthorized)"
      });
    }
    if (!bio || !hourlyRate || !experience) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }
    const existingProfile = await tutorService.getProfileByUserId(user.id);
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }
    const profile = await tutorService.createProfile(user.id, {
      bio,
      hourlyRate,
      experience
    });
    return res.status(201).json({
      message: "Profile created Successufully",
      profile
    });
  } catch (error) {
    next(error);
  }
};
var getAllTutors2 = async (req, res, next) => {
  try {
    const filters = {};
    if (req.query.subject) {
      filters.subject = req.query.subject;
    }
    if (req.query.minRating) {
      filters.minRating = Number(req.query.minRating);
    }
    if (req.query.minPrice) {
      filters.minPrice = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filters.maxPrice = Number(req.query.maxPrice);
    }
    const tutors = await tutorService.getAllTutors(filters);
    return res.status(200).json({
      success: true,
      data: tutors
    });
  } catch (error) {
    next(error);
  }
};
var getTutorById2 = async (req, res) => {
  const id = req.params.id;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid tutor ID" });
  }
  const tutor = await tutorService.getTutorById(id);
  if (!tutor) return res.status(404).json({ message: "Tutor not found" });
  res.json(tutor);
};
var updateTutorProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { bio, hourlyRate, experience } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!bio && !hourlyRate && !experience) {
      return res.status(400).json({ message: "At least one field is required" });
    }
    const updatedProfile = await tutorService.updateProfile(userId, {
      bio,
      hourlyRate,
      experience
    });
    if (!updatedProfile)
      return res.status(404).json({ message: "Profile not found" });
    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};
var tutorController = {
  createTutorProfile,
  updateTutorProfile,
  getAllTutors: getAllTutors2,
  getTutorById: getTutorById2
};

// src/middlewares/auth.ts
var auth2 = (...roles) => {
  return async (req, res, next) => {
    try {
      const session = await auth.api.getSession({
        headers: req.headers
      });
      if (!session) {
        return res.status(401).json({
          success: false,
          message: "You are not authorized!"
        });
      }
      if (!session.user.emailVerified) {
        return res.status(403).json({
          success: false,
          message: "Please verify your email to access this resource."
        });
      }
      req.user = {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
        emailVerified: session.user.emailVerified
      };
      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to access this resource."
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth2;

// src/modules/tutor/tutor.routes.ts
var router = express.Router();
router.post("/", auth_default("TUTOR" /* TUTOR */), tutorController.createTutorProfile);
router.get("/", tutorController.getAllTutors);
router.get("/:id", tutorController.getTutorById);
router.put(
  "/profile",
  auth_default("TUTOR" /* TUTOR */),
  tutorController.updateTutorProfile
);
var tutorRouter = router;

// src/modules/booking/booking.routes.ts
import express2 from "express";

// src/modules/booking/booking.service.ts
var createBooking = async (data) => {
  const availability = await prisma.availability.findUnique({
    where: { id: data.availabilityId }
  });
  if (!availability) {
    throw new Error("Availability slot not found");
  }
  if (availability.isBooked) {
    throw new Error("This availability slot is already booked");
  }
  const booking = await prisma.booking.create({
    data,
    include: {
      tutor: { include: { user: true } },
      category: true
    }
  });
  await prisma.availability.update({
    where: { id: data.availabilityId },
    data: { isBooked: true }
  });
  return booking;
};
var getAllBookings = async () => {
  return prisma.booking.findMany({
    orderBy: { sessionDate: "desc" }
  });
};
var getStudentBookings = async (studentId) => {
  return prisma.booking.findMany({
    where: { studentId },
    orderBy: { sessionDate: "desc" },
    include: {
      tutor: { include: { user: true } },
      category: true,
      review: true
    }
  });
};
var getTutorBookings = async (userId) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId }
  });
  if (!tutor) throw new Error("Tutor profile not found");
  return prisma.booking.findMany({
    where: { tutorProfileId: tutor.id },
    orderBy: { sessionDate: "desc" },
    include: {
      student: true,
      category: true,
      review: true
    }
  });
};
var cancelBooking = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.studentId !== userId) {
    throw new Error("Unauthorized to cancel this booking");
  }
  if (booking.status !== BookingStatus.CONFIRMED) {
    throw new Error("Only confirmed bookings can be cancelled");
  }
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED }
  });
  if (booking.availabilityId) {
    await prisma.availability.update({
      where: { id: booking.availabilityId },
      data: { isBooked: false }
    });
  }
  return updatedBooking;
};
var bookingService = {
  createBooking,
  getAllBookings,
  getStudentBookings,
  getTutorBookings,
  cancelBooking
};

// src/modules/booking/booking.controller.ts
var createBooking2 = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking({
      ...req.body,
      studentId: req.user.id
    });
    res.status(201).json({
      message: "Booking created successfully",
      booking
    });
  } catch (error) {
    next(error);
  }
};
var getAllBookings2 = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};
var getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getStudentBookings(req.user.id);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};
var getTutorSessions = async (req, res, next) => {
  try {
    const bookings = await bookingService.getTutorBookings(req.user.id);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};
var cancelMyBooking = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    const booking = await bookingService.cancelBooking(id, req.user.id);
    res.json({
      message: "Booking cancelled successfully",
      booking
    });
  } catch (error) {
    next(error);
  }
};
var bookingController = {
  createBooking: createBooking2,
  getAllBookings: getAllBookings2,
  getMyBookings,
  getTutorSessions,
  cancelMyBooking
};

// src/modules/booking/booking.routes.ts
var router2 = express2.Router();
router2.post(
  "/",
  auth_default("STUDENT" /* STUDENT */, "ADMIN" /* ADMIN */),
  bookingController.createBooking
);
router2.get("/", auth_default("ADMIN" /* ADMIN */), bookingController.getAllBookings);
router2.get("/me", auth_default("STUDENT" /* STUDENT */), bookingController.getMyBookings);
router2.patch(
  "/:id/cancel",
  auth_default("STUDENT" /* STUDENT */),
  bookingController.cancelMyBooking
);
router2.get(
  "/tutor/me",
  auth_default("TUTOR" /* TUTOR */),
  bookingController.getTutorSessions
);
var bookingRouter = router2;

// src/modules/category/category.routes.ts
import { Router as Router3 } from "express";

// src/modules/category/category.service.ts
var createCategory = async (name) => {
  return prisma.category.create({ data: { name } });
};
var getAllCategories = async () => {
  return prisma.category.findMany({ where: { isActive: true } });
};
var updateCategoryStatus = async (id, isActive) => {
  return prisma.category.update({
    where: { id },
    data: { isActive }
  });
};
var categoryService = {
  createCategory,
  getAllCategories,
  updateCategoryStatus
};

// src/modules/category/category.controller.ts
var createCategory2 = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body.name);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};
var getCategories = async (_, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};
var updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategoryStatus(
      req.params.id,
      req.body.isActive
    );
    res.json(category);
  } catch (error) {
    next(error);
  }
};
var categoryController = {
  createCategory: createCategory2,
  getCategories,
  updateCategory
};

// src/modules/category/category.routes.ts
var router3 = Router3();
router3.get("/", categoryController.getCategories);
router3.post("/", auth_default("ADMIN" /* ADMIN */), categoryController.createCategory);
router3.patch("/:id", auth_default("ADMIN" /* ADMIN */), categoryController.updateCategory);
var categoryRouter = router3;

// src/modules/availability/availability.routes.ts
import { Router as Router4 } from "express";

// src/modules/availability/availability.service.ts
var createAvailability = async (data) => {
  const conflict = await prisma.availability.findFirst({
    where: {
      tutorProfileId: data.tutorProfileId,
      dayOfWeek: data.dayOfWeek,
      startTime: { lt: data.endTime },
      endTime: { gt: data.startTime }
    }
  });
  if (conflict) {
    throw new Error("Availability slot overlaps with an existing one");
  }
  return prisma.availability.create({
    data
  });
};
var getTutorAvailability = async (tutorProfileId) => {
  return prisma.availability.findMany({
    where: {
      tutorProfileId,
      isBooked: false
    },
    orderBy: {
      startTime: "asc"
    }
  });
};
var deleteAvailability = async (id, tutorProfileId) => {
  const slot = await prisma.availability.findUnique({ where: { id } });
  if (!slot || slot.tutorProfileId !== tutorProfileId) {
    throw new Error("Availability not found or unauthorized");
  }
  if (slot.isBooked) {
    throw new Error("Cannot delete a booked slot");
  }
  return prisma.availability.delete({ where: { id } });
};
var availabilityService = {
  createAvailability,
  getTutorAvailability,
  deleteAvailability
};

// src/modules/availability/availability.controller.ts
var createAvailability2 = async (req, res, next) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!tutor) throw new Error("Tutor profile not found");
    const slot = await availabilityService.createAvailability({
      tutorProfileId: tutor.id,
      ...req.body
    });
    res.status(201).json(slot);
  } catch (error) {
    next(error);
  }
};
var getMyAvailability = async (req, res, next) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!tutor) throw new Error("Tutor profile not found");
    const slots = await availabilityService.getTutorAvailability(tutor.id);
    res.json(slots);
  } catch (error) {
    next(error);
  }
};
var deleteAvailability2 = async (req, res, next) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!tutor) throw new Error("Tutor profile not found");
    const slot = await availabilityService.deleteAvailability(
      req.params.id,
      tutor.id
    );
    res.json({ message: "Availability removed", slot });
  } catch (error) {
    next(error);
  }
};
var availabilityController = {
  createAvailability: createAvailability2,
  getMyAvailability,
  deleteAvailability: deleteAvailability2
};

// src/modules/availability/availability.routes.ts
var router4 = Router4();
router4.post(
  "/",
  auth_default("TUTOR" /* TUTOR */),
  availabilityController.createAvailability
);
router4.get("/", auth_default("TUTOR" /* TUTOR */), availabilityController.getMyAvailability);
router4.delete(
  "/:id",
  auth_default("TUTOR" /* TUTOR */),
  availabilityController.deleteAvailability
);
var availabilityRouter = router4;

// src/modules/review/review.routes.ts
import express3 from "express";

// src/modules/review/review.service.ts
var createReview = async (data) => {
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { tutor: true }
  });
  if (!booking) {
    throw new Error("Booking not found");
  }
  if (booking.studentId !== data.studentId) {
    throw new Error("Unauthorized to review this booking");
  }
  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error("You can review only completed sessions");
  }
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: data.bookingId }
  });
  if (existingReview) {
    throw new Error("Review already submitted for this booking");
  }
  const review = await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      studentId: data.studentId,
      tutorProfileId: booking.tutorProfileId,
      rating: data.rating,
      comment: data.comment
    }
  });
  const stats = await prisma.review.aggregate({
    where: { tutorProfileId: booking.tutorProfileId },
    _avg: { rating: true },
    _count: { rating: true }
  });
  await prisma.tutorProfile.update({
    where: { id: booking.tutorProfileId },
    data: {
      avgRating: stats._avg.rating ?? 0,
      totalReviews: stats._count.rating
    }
  });
  return review;
};
var reviewService = {
  createReview
};

// src/modules/review/review.controller.ts
var createReview2 = async (req, res, next) => {
  try {
    const review = await reviewService.createReview({
      ...req.body,
      studentId: req.user.id
    });
    res.status(201).json({
      message: "Review submitted successfully",
      review
    });
  } catch (error) {
    next(error);
  }
};
var reviewController = {
  createReview: createReview2
};

// src/modules/review/review.routes.ts
var router5 = express3.Router();
router5.post("/", auth_default("STUDENT" /* STUDENT */), reviewController.createReview);
var reviewRouter = router5;

// src/modules/auth/auth.routes.ts
import express4 from "express";

// src/modules/auth/auth.service.ts
var getCurrentUser = async (userId) => {
  return await prisma.user.findUnique({
    where: { id: userId }
  });
};
var authService = {
  getCurrentUser
};

// src/modules/auth/auth.controller.ts
var getCurrentUser2 = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const result = await authService.getCurrentUser(userId);
    if (!result) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ "Current User": result });
  } catch (error) {
    next(error);
  }
};
var authController = {
  getCurrentUser: getCurrentUser2
};

// src/modules/auth/auth.routes.ts
var router6 = express4.Router();
router6.get(
  "/me",
  auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */, "ADMIN" /* ADMIN */),
  authController.getCurrentUser
);
var authRouter = router6;

// src/modules/admin/admin.routes.ts
import express5 from "express";

// src/modules/admin/admin.service.ts
var getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });
};
var updateUserStatus = async (id, status) => {
  return prisma.user.update({
    where: { id },
    data: { status }
  });
};
var adminService = {
  getAllUsers,
  updateUserStatus
};

// src/modules/admin/admin.controller.ts
var getAllUsers2 = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    return res.status(200).json({ users });
  } catch (error) {
    next(error);
  }
};
var updateUserStatus2 = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const updatedUser = await adminService.updateUserStatus(
      id,
      status
    );
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user: updatedUser });
  } catch (error) {
    next(error);
  }
};
var adminController = {
  getAllUsers: getAllUsers2,
  updateUserStatus: updateUserStatus2
};

// src/modules/admin/admin.routes.ts
var router7 = express5.Router();
router7.get("/users", auth_default("ADMIN" /* ADMIN */), adminController.getAllUsers);
router7.patch(
  "/users/:id",
  auth_default("ADMIN" /* ADMIN */),
  adminController.updateUserStatus
);
var adminRouter = router7;

// src/app.ts
var app = express6();
app.use(
  cors({
    origin: process.env.APP_URL || "http://localhost:3000",
    credentials: true
  })
);
app.use(express6.json());
app.use("/api/auth", authRouter);
app.all("/api/auth/*splat", toNodeHandler(auth));
app.use("/api/tutors", tutorRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/availability", availabilityRouter);
app.use("/api/admin", adminRouter);
app.get("/", (req, res) => {
  res.send("Welcome to the Skill Bridge Application!");
});
app.use(notFound);
app.use(globalErrorHandler_default);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
