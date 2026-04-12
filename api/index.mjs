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
  "inlineSchema": 'model User {\n  id            String     @id\n  name          String\n  email         String\n  emailVerified Boolean    @default(false)\n  image         String?\n  createdAt     DateTime   @default(now())\n  updatedAt     DateTime   @updatedAt\n  role          UserRole   @default(STUDENT)\n  phone         String?\n  status        UserStatus @default(ACTIVE)\n  sessions      Session[]\n  accounts      Account[]\n\n  // SkillBridge relations\n  tutorProfile      TutorProfile?\n  studentBookings   Booking[]          @relation("StudentBookings")\n  reviews           Review[]\n  reportedContent   Report[]           @relation("ReportsCreated")\n  assignedReports   Report[]           @relation("ReportsModerated")\n  moderationActions ModerationAction[] @relation("ModerationActionsTaken")\n  supportTickets    SupportTicket[]    @relation("SupportTicketsCreated")\n  assignedTickets   SupportTicket[]    @relation("SupportTicketsAssigned")\n  contactRequests   ContactRequest[]   @relation("ContactRequestsCreated")\n  handledContacts   ContactRequest[]   @relation("ContactRequestsHandled")\n\n  @@unique([email])\n  @@map("user")\n}\n\nenum UserRole {\n  STUDENT\n  TUTOR\n  ADMIN\n  MODERATOR\n  SUPPORT_MANAGER\n}\n\nenum UserStatus {\n  ACTIVE\n  BLOCKED\n  SUSPENDED\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel Availability {\n  id             String  @id @default(uuid())\n  tutorProfileId String\n  dayOfWeek      Int // 0 = Sunday, 6 = Saturday\n  startTime      String // "14:00"\n  endTime        String // "16:00"\n  isBooked       Boolean @default(false)\n\n  tutor   TutorProfile @relation(fields: [tutorProfileId], references: [id])\n  booking Booking?\n\n  createdAt DateTime @default(now())\n}\n\nmodel Booking {\n  id                 String        @id @default(uuid())\n  studentId          String\n  tutorProfileId     String\n  categoryId         String\n  availabilityId     String?       @unique\n  sessionDate        DateTime\n  startTime          String\n  endTime            String\n  status             BookingStatus @default(CONFIRMED)\n  cancellationReason String?\n\n  student        User            @relation("StudentBookings", fields: [studentId], references: [id])\n  tutor          TutorProfile    @relation(fields: [tutorProfileId], references: [id])\n  category       Category        @relation(fields: [categoryId], references: [id])\n  availability   Availability?   @relation(fields: [availabilityId], references: [id])\n  review         Review?\n  supportTickets SupportTicket[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nenum BookingStatus {\n  CONFIRMED\n  COMPLETED\n  CANCELLED\n}\n\nmodel Category {\n  id       String  @id @default(uuid())\n  name     String  @unique\n  isActive Boolean @default(true)\n\n  bookings        Booking[]\n  tutorCategories TutorCategory[]\n}\n\nmodel TutorCategory {\n  id             String @id @default(uuid())\n  tutorProfileId String\n  categoryId     String\n\n  tutor    TutorProfile @relation(fields: [tutorProfileId], references: [id])\n  category Category     @relation(fields: [categoryId], references: [id])\n\n  @@unique([tutorProfileId, categoryId])\n}\n\nmodel Report {\n  id           String           @id @default(uuid())\n  reporterId   String\n  targetType   ReportTargetType\n  targetId     String\n  reason       String\n  details      String?\n  status       ReportStatus     @default(PENDING)\n  moderatorId  String?\n  decisionNote String?\n\n  reporter          User               @relation("ReportsCreated", fields: [reporterId], references: [id])\n  moderator         User?              @relation("ReportsModerated", fields: [moderatorId], references: [id])\n  review            Review?            @relation("ReviewReports", fields: [reviewId], references: [id])\n  reviewId          String?\n  tutorProfile      TutorProfile?      @relation("TutorProfileReports", fields: [tutorProfileId], references: [id])\n  tutorProfileId    String?\n  moderationActions ModerationAction[]\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  @@index([targetType, targetId])\n}\n\nmodel ModerationAction {\n  id             String               @id @default(uuid())\n  reportId       String\n  moderatorId    String\n  actionType     ModerationActionType\n  note           String?\n  reviewId       String?\n  tutorProfileId String?\n\n  report       Report        @relation(fields: [reportId], references: [id])\n  moderator    User          @relation("ModerationActionsTaken", fields: [moderatorId], references: [id])\n  review       Review?       @relation("ReviewModerationActions", fields: [reviewId], references: [id])\n  tutorProfile TutorProfile? @relation("TutorProfileModerationActions", fields: [tutorProfileId], references: [id])\n\n  createdAt DateTime @default(now())\n}\n\nmodel SupportTicket {\n  id             String              @id @default(uuid())\n  userId         String\n  bookingId      String?\n  assignedToId   String?\n  subject        String\n  message        String\n  type           SupportTicketType\n  status         SupportTicketStatus @default(OPEN)\n  priority       TicketPriority      @default(MEDIUM)\n  resolutionNote String?\n\n  user       User     @relation("SupportTicketsCreated", fields: [userId], references: [id])\n  booking    Booking? @relation(fields: [bookingId], references: [id])\n  assignedTo User?    @relation("SupportTicketsAssigned", fields: [assignedToId], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nmodel ContactRequest {\n  id           String               @id @default(uuid())\n  userId       String?\n  handledById  String?\n  name         String\n  email        String\n  subject      String\n  message      String\n  status       ContactRequestStatus @default(OPEN)\n  responseNote String?\n\n  user      User? @relation("ContactRequestsCreated", fields: [userId], references: [id])\n  handledBy User? @relation("ContactRequestsHandled", fields: [handledById], references: [id])\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\nenum ReportTargetType {\n  REVIEW\n  TUTOR_PROFILE\n}\n\nenum ReportStatus {\n  PENDING\n  UNDER_REVIEW\n  RESOLVED\n  DISMISSED\n}\n\nenum ModerationStatus {\n  PENDING\n  APPROVED\n  HIDDEN\n  FLAGGED\n}\n\nenum ModerationActionType {\n  APPROVE_REVIEW\n  HIDE_REVIEW\n  FLAG_TUTOR_PROFILE\n  CLEAR_TUTOR_PROFILE\n}\n\nenum SupportTicketType {\n  GENERAL\n  BOOKING_ISSUE\n  ACCOUNT_HELP\n  CANCELLATION\n  REFUND\n}\n\nenum SupportTicketStatus {\n  OPEN\n  PENDING\n  RESOLVED\n}\n\nenum TicketPriority {\n  LOW\n  MEDIUM\n  HIGH\n  URGENT\n}\n\nenum ContactRequestStatus {\n  OPEN\n  IN_PROGRESS\n  RESOLVED\n}\n\nmodel Review {\n  id               String           @id @default(uuid())\n  bookingId        String           @unique\n  studentId        String\n  tutorProfileId   String\n  rating           Int\n  comment          String?\n  isHidden         Boolean          @default(false)\n  moderationStatus ModerationStatus @default(PENDING)\n\n  booking           Booking            @relation(fields: [bookingId], references: [id])\n  student           User               @relation(fields: [studentId], references: [id])\n  tutor             TutorProfile       @relation(fields: [tutorProfileId], references: [id])\n  reports           Report[]           @relation("ReviewReports")\n  moderationActions ModerationAction[] @relation("ReviewModerationActions")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?\n// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel TutorProfile {\n  id             String  @id @default(uuid())\n  userId         String  @unique\n  bio            String\n  hourlyRate     Float\n  experience     Int\n  teachingMethod String?\n  headline       String?\n  avgRating      Float   @default(0)\n  totalReviews   Int     @default(0)\n  isVerified     Boolean @default(false)\n\n  user              User               @relation(fields: [userId], references: [id])\n  bookings          Booking[]\n  reviews           Review[]\n  availability      Availability[]\n  tutorCategories   TutorCategory[]\n  reports           Report[]           @relation("TutorProfileReports")\n  moderationActions ModerationAction[] @relation("TutorProfileModerationActions")\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"phone","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileToUser"},{"name":"studentBookings","kind":"object","type":"Booking","relationName":"StudentBookings"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToUser"},{"name":"reportedContent","kind":"object","type":"Report","relationName":"ReportsCreated"},{"name":"assignedReports","kind":"object","type":"Report","relationName":"ReportsModerated"},{"name":"moderationActions","kind":"object","type":"ModerationAction","relationName":"ModerationActionsTaken"},{"name":"supportTickets","kind":"object","type":"SupportTicket","relationName":"SupportTicketsCreated"},{"name":"assignedTickets","kind":"object","type":"SupportTicket","relationName":"SupportTicketsAssigned"},{"name":"contactRequests","kind":"object","type":"ContactRequest","relationName":"ContactRequestsCreated"},{"name":"handledContacts","kind":"object","type":"ContactRequest","relationName":"ContactRequestsHandled"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"Availability":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"dayOfWeek","kind":"scalar","type":"Int"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"isBooked","kind":"scalar","type":"Boolean"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"AvailabilityToTutorProfile"},{"name":"booking","kind":"object","type":"Booking","relationName":"AvailabilityToBooking"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Booking":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"availabilityId","kind":"scalar","type":"String"},{"name":"sessionDate","kind":"scalar","type":"DateTime"},{"name":"startTime","kind":"scalar","type":"String"},{"name":"endTime","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"BookingStatus"},{"name":"cancellationReason","kind":"scalar","type":"String"},{"name":"student","kind":"object","type":"User","relationName":"StudentBookings"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"BookingToTutorProfile"},{"name":"category","kind":"object","type":"Category","relationName":"BookingToCategory"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToBooking"},{"name":"review","kind":"object","type":"Review","relationName":"BookingToReview"},{"name":"supportTickets","kind":"object","type":"SupportTicket","relationName":"BookingToSupportTicket"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Category":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToCategory"},{"name":"tutorCategories","kind":"object","type":"TutorCategory","relationName":"CategoryToTutorCategory"}],"dbName":null},"TutorCategory":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"categoryId","kind":"scalar","type":"String"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"TutorCategoryToTutorProfile"},{"name":"category","kind":"object","type":"Category","relationName":"CategoryToTutorCategory"}],"dbName":null},"Report":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"reporterId","kind":"scalar","type":"String"},{"name":"targetType","kind":"enum","type":"ReportTargetType"},{"name":"targetId","kind":"scalar","type":"String"},{"name":"reason","kind":"scalar","type":"String"},{"name":"details","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ReportStatus"},{"name":"moderatorId","kind":"scalar","type":"String"},{"name":"decisionNote","kind":"scalar","type":"String"},{"name":"reporter","kind":"object","type":"User","relationName":"ReportsCreated"},{"name":"moderator","kind":"object","type":"User","relationName":"ReportsModerated"},{"name":"review","kind":"object","type":"Review","relationName":"ReviewReports"},{"name":"reviewId","kind":"scalar","type":"String"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileReports"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"moderationActions","kind":"object","type":"ModerationAction","relationName":"ModerationActionToReport"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"ModerationAction":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"reportId","kind":"scalar","type":"String"},{"name":"moderatorId","kind":"scalar","type":"String"},{"name":"actionType","kind":"enum","type":"ModerationActionType"},{"name":"note","kind":"scalar","type":"String"},{"name":"reviewId","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"report","kind":"object","type":"Report","relationName":"ModerationActionToReport"},{"name":"moderator","kind":"object","type":"User","relationName":"ModerationActionsTaken"},{"name":"review","kind":"object","type":"Review","relationName":"ReviewModerationActions"},{"name":"tutorProfile","kind":"object","type":"TutorProfile","relationName":"TutorProfileModerationActions"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"SupportTicket":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"assignedToId","kind":"scalar","type":"String"},{"name":"subject","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"SupportTicketType"},{"name":"status","kind":"enum","type":"SupportTicketStatus"},{"name":"priority","kind":"enum","type":"TicketPriority"},{"name":"resolutionNote","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SupportTicketsCreated"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToSupportTicket"},{"name":"assignedTo","kind":"object","type":"User","relationName":"SupportTicketsAssigned"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"ContactRequest":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"handledById","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"subject","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ContactRequestStatus"},{"name":"responseNote","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ContactRequestsCreated"},{"name":"handledBy","kind":"object","type":"User","relationName":"ContactRequestsHandled"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"bookingId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"tutorProfileId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"isHidden","kind":"scalar","type":"Boolean"},{"name":"moderationStatus","kind":"enum","type":"ModerationStatus"},{"name":"booking","kind":"object","type":"Booking","relationName":"BookingToReview"},{"name":"student","kind":"object","type":"User","relationName":"ReviewToUser"},{"name":"tutor","kind":"object","type":"TutorProfile","relationName":"ReviewToTutorProfile"},{"name":"reports","kind":"object","type":"Report","relationName":"ReviewReports"},{"name":"moderationActions","kind":"object","type":"ModerationAction","relationName":"ReviewModerationActions"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null},"TutorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"hourlyRate","kind":"scalar","type":"Float"},{"name":"experience","kind":"scalar","type":"Int"},{"name":"teachingMethod","kind":"scalar","type":"String"},{"name":"headline","kind":"scalar","type":"String"},{"name":"avgRating","kind":"scalar","type":"Float"},{"name":"totalReviews","kind":"scalar","type":"Int"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"user","kind":"object","type":"User","relationName":"TutorProfileToUser"},{"name":"bookings","kind":"object","type":"Booking","relationName":"BookingToTutorProfile"},{"name":"reviews","kind":"object","type":"Review","relationName":"ReviewToTutorProfile"},{"name":"availability","kind":"object","type":"Availability","relationName":"AvailabilityToTutorProfile"},{"name":"tutorCategories","kind":"object","type":"TutorCategory","relationName":"TutorCategoryToTutorProfile"},{"name":"reports","kind":"object","type":"Report","relationName":"TutorProfileReports"},{"name":"moderationActions","kind":"object","type":"ModerationAction","relationName":"TutorProfileModerationActions"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":null}},"enums":{},"types":{}}');
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
  ContactRequestScalarFieldEnum: () => ContactRequestScalarFieldEnum,
  DbNull: () => DbNull2,
  Decimal: () => Decimal2,
  JsonNull: () => JsonNull2,
  ModelName: () => ModelName,
  ModerationActionScalarFieldEnum: () => ModerationActionScalarFieldEnum,
  NullTypes: () => NullTypes2,
  NullsOrder: () => NullsOrder,
  PrismaClientInitializationError: () => PrismaClientInitializationError2,
  PrismaClientKnownRequestError: () => PrismaClientKnownRequestError2,
  PrismaClientRustPanicError: () => PrismaClientRustPanicError2,
  PrismaClientUnknownRequestError: () => PrismaClientUnknownRequestError2,
  PrismaClientValidationError: () => PrismaClientValidationError2,
  QueryMode: () => QueryMode,
  ReportScalarFieldEnum: () => ReportScalarFieldEnum,
  ReviewScalarFieldEnum: () => ReviewScalarFieldEnum,
  SessionScalarFieldEnum: () => SessionScalarFieldEnum,
  SortOrder: () => SortOrder,
  Sql: () => Sql2,
  SupportTicketScalarFieldEnum: () => SupportTicketScalarFieldEnum,
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
  Report: "Report",
  ModerationAction: "ModerationAction",
  SupportTicket: "SupportTicket",
  ContactRequest: "ContactRequest",
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
  cancellationReason: "cancellationReason",
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
var ReportScalarFieldEnum = {
  id: "id",
  reporterId: "reporterId",
  targetType: "targetType",
  targetId: "targetId",
  reason: "reason",
  details: "details",
  status: "status",
  moderatorId: "moderatorId",
  decisionNote: "decisionNote",
  reviewId: "reviewId",
  tutorProfileId: "tutorProfileId",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ModerationActionScalarFieldEnum = {
  id: "id",
  reportId: "reportId",
  moderatorId: "moderatorId",
  actionType: "actionType",
  note: "note",
  reviewId: "reviewId",
  tutorProfileId: "tutorProfileId",
  createdAt: "createdAt"
};
var SupportTicketScalarFieldEnum = {
  id: "id",
  userId: "userId",
  bookingId: "bookingId",
  assignedToId: "assignedToId",
  subject: "subject",
  message: "message",
  type: "type",
  status: "status",
  priority: "priority",
  resolutionNote: "resolutionNote",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ContactRequestScalarFieldEnum = {
  id: "id",
  userId: "userId",
  handledById: "handledById",
  name: "name",
  email: "email",
  subject: "subject",
  message: "message",
  status: "status",
  responseNote: "responseNote",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var ReviewScalarFieldEnum = {
  id: "id",
  bookingId: "bookingId",
  studentId: "studentId",
  tutorProfileId: "tutorProfileId",
  rating: "rating",
  comment: "comment",
  isHidden: "isHidden",
  moderationStatus: "moderationStatus",
  createdAt: "createdAt",
  updatedAt: "updatedAt"
};
var TutorProfileScalarFieldEnum = {
  id: "id",
  userId: "userId",
  bio: "bio",
  hourlyRate: "hourlyRate",
  experience: "experience",
  teachingMethod: "teachingMethod",
  headline: "headline",
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
var ReportTargetType = {
  REVIEW: "REVIEW",
  TUTOR_PROFILE: "TUTOR_PROFILE"
};
var ReportStatus = {
  PENDING: "PENDING",
  UNDER_REVIEW: "UNDER_REVIEW",
  RESOLVED: "RESOLVED",
  DISMISSED: "DISMISSED"
};
var ModerationStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  HIDDEN: "HIDDEN",
  FLAGGED: "FLAGGED"
};
var ModerationActionType = {
  APPROVE_REVIEW: "APPROVE_REVIEW",
  HIDE_REVIEW: "HIDE_REVIEW",
  FLAG_TUTOR_PROFILE: "FLAG_TUTOR_PROFILE",
  CLEAR_TUTOR_PROFILE: "CLEAR_TUTOR_PROFILE"
};
var SupportTicketType = {
  GENERAL: "GENERAL",
  BOOKING_ISSUE: "BOOKING_ISSUE",
  ACCOUNT_HELP: "ACCOUNT_HELP",
  CANCELLATION: "CANCELLATION",
  REFUND: "REFUND"
};
var SupportTicketStatus = {
  OPEN: "OPEN",
  PENDING: "PENDING",
  RESOLVED: "RESOLVED"
};
var TicketPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT"
};

// generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/database-url.ts
var REQUIRE_SSL_MODE = "require";
var VERIFY_FULL_SSL_MODE = "verify-full";
function normalizeDatabaseUrl(connectionString2) {
  try {
    const databaseUrl = new URL(connectionString2);
    const sslMode = databaseUrl.searchParams.get("sslmode");
    const usesLibpqCompat = databaseUrl.searchParams.has("uselibpqcompat");
    if (sslMode?.toLowerCase() === REQUIRE_SSL_MODE && !usesLibpqCompat) {
      databaseUrl.searchParams.set("sslmode", VERIFY_FULL_SSL_MODE);
      return databaseUrl.toString();
    }
  } catch {
    return connectionString2;
  }
  return connectionString2;
}

// src/lib/prisma.ts
var rawConnectionString = process.env.DATABASE_URL;
if (!rawConnectionString) {
  throw new Error("DATABASE_URL is not set in environment variables");
}
var connectionString = normalizeDatabaseUrl(rawConnectionString);
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
import nodemailer from "nodemailer";
var appUrl = process.env.APP_URL || "http://localhost:3000";
var isProduction = process.env.NODE_ENV === "production";
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
  baseURL: `${appUrl}/api/auth`,
  trustedOrigins: [appUrl, "http://localhost:3000", "http://localhost:3001"],
  cookies: {
    paddingToken: {
      name: "padding-token"
    }
  },
  cookie: {
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
  },
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
      const verificationUrl = `${appUrl}/verify-email?token=${token}`;
      const info = await transporter.sendMail({
        from: '"SkillBridge" <no-reply@skillbridge.com>',
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
        background-color: #0070f3;
        padding: 40px 20px;
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
        background-color: #0070f3;
        color: #ffffff;
        padding: 16px 32px;
        text-decoration: none;
        font-size: 16px;
        font-weight: bold;
        border-radius: 8px;
        display: inline-block;
        box-shadow: 0 4px 14px 0 rgba(0, 118, 255, 0.39);
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
        <h1>SkillBridge</h1>
      </div>

      <div class="content">
        <h2>Verify your email address</h2>

        <p>Hello ${user.name},</p>

        <p>
          Thank you for registering with <strong>SkillBridge</strong>.
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

        <p>Best regards,<br />SkillBridge Team</p>
      </div>

      <div class="footer">
        \xA9 2026 SkillBridge. All rights reserved.
      </div>
    </div>
  </body>
</html>
`
      });
      console.log("Verification email sent:", info.messageId);
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
  let errorMessage = err.message || "Internal Server Error";
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
    success: false,
    message: errorMessage,
    ...process.env.NODE_ENV !== "production" ? { error: errorDetails } : {}
  });
}
var globalErrorHandler_default = errorHandler;

// src/modules/tutor/tutor.routes.ts
import express from "express";

// src/modules/tutor/tutor.service.ts
var createProfile = async (userId, data) => {
  return await prisma.tutorProfile.create({
    data: {
      userId,
      bio: data.bio,
      hourlyRate: data.hourlyRate,
      experience: data.experience,
      teachingMethod: data.teachingMethod,
      headline: data.headline,
      ...data.categories && {
        tutorCategories: {
          create: data.categories.map((categoryId) => ({
            category: { connect: { id: categoryId } }
          }))
        }
      }
    },
    include: {
      tutorCategories: { include: { category: true } }
    }
  });
};
var publicReviewInclude = {
  where: { isHidden: false },
  orderBy: { createdAt: "desc" },
  include: {
    student: {
      select: {
        id: true,
        name: true,
        image: true
      }
    }
  }
};
var getProfileByUserId = async (userId) => {
  return await prisma.tutorProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      tutorCategories: { include: { category: true } },
      availability: true,
      reviews: publicReviewInclude
    }
  });
};
var getAllTutors = async (filters) => {
  const {
    subject,
    categoryId,
    search,
    minRating,
    minPrice,
    maxPrice,
    page = 1,
    limit = 12,
    sortBy = "avgRating",
    sortOrder = "desc"
  } = filters;
  const where = {};
  const skip = (page - 1) * limit;
  if (minPrice !== void 0 || maxPrice !== void 0) {
    where.hourlyRate = {};
    if (minPrice !== void 0) where.hourlyRate.gte = Number(minPrice);
    if (maxPrice !== void 0) where.hourlyRate.lte = Number(maxPrice);
    if (Object.keys(where.hourlyRate).length === 0) delete where.hourlyRate;
  }
  if (minRating !== void 0) {
    where.avgRating = { gte: Number(minRating) };
  }
  if (categoryId) {
    where.tutorCategories = {
      some: {
        categoryId
      }
    };
  } else if (subject) {
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
  if (search) {
    where.OR = [
      {
        user: {
          name: {
            contains: search,
            mode: "insensitive"
          }
        }
      },
      {
        tutorCategories: {
          some: {
            category: {
              name: {
                contains: search,
                mode: "insensitive"
              }
            }
          }
        }
      }
    ];
  }
  const [tutors, total] = await Promise.all([
    prisma.tutorProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true }
        },
        tutorCategories: { include: { category: true } },
        availability: { where: { isBooked: false } },
        reviews: publicReviewInclude
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit
    }),
    prisma.tutorProfile.count({ where })
  ]);
  return {
    data: tutors,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      sortBy,
      sortOrder
    }
  };
};
var getTutorById = async (id) => {
  return await prisma.tutorProfile.findUnique({
    where: { id },
    include: {
      user: true,
      tutorCategories: { include: { category: true } },
      availability: true,
      reviews: publicReviewInclude
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
      teachingMethod: data.teachingMethod ?? existingProfile.teachingMethod,
      headline: data.headline ?? existingProfile.headline,
      updatedAt: /* @__PURE__ */ new Date(),
      ...data.categories && {
        tutorCategories: {
          deleteMany: {},
          create: data.categories.map((categoryId) => ({
            category: { connect: { id: categoryId } }
          }))
        }
      }
    },
    include: {
      tutorCategories: { include: { category: true } }
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

// src/utils/apiResponse.ts
var sendSuccess = (data, message, meta) => {
  return {
    success: true,
    message,
    data,
    ...meta ? { meta } : {}
  };
};

// src/modules/tutor/tutor.controller.ts
var allowedTutorSortBy = /* @__PURE__ */ new Set([
  "avgRating",
  "hourlyRate",
  "experience",
  "createdAt"
]);
var allowedTutorSortOrder = /* @__PURE__ */ new Set(["asc", "desc"]);
var createTutorProfile = async (req, res, next) => {
  try {
    const user = req.user;
    const { bio, hourlyRate, experience, teachingMethod, headline, categories } = req.body;
    if (!user) {
      return res.status(400).json({
        error: "User information is missing (Unauthorized)"
      });
    }
    if (bio === void 0 || hourlyRate === void 0 || experience === void 0) {
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
      experience,
      teachingMethod,
      headline,
      categories
    });
    return res.status(201).json(sendSuccess(profile, "Profile created successfully"));
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
    if (req.query.categoryId) {
      filters.categoryId = req.query.categoryId;
    }
    if (req.query.search) {
      filters.search = req.query.search;
    }
    if (req.query.page) {
      filters.page = Number(req.query.page);
    }
    if (req.query.limit) {
      filters.limit = Number(req.query.limit);
    }
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy;
      if (!allowedTutorSortBy.has(sortBy)) {
        return res.status(400).json({ message: "Invalid sortBy value" });
      }
      filters.sortBy = sortBy;
    }
    if (req.query.sortOrder) {
      const sortOrder = req.query.sortOrder;
      if (!allowedTutorSortOrder.has(sortOrder)) {
        return res.status(400).json({ message: "Invalid sortOrder value" });
      }
      filters.sortOrder = sortOrder;
    }
    const tutors = await tutorService.getAllTutors(filters);
    return res.status(200).json(sendSuccess(tutors.data, "Tutors fetched successfully", tutors.meta));
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
  res.json(sendSuccess(tutor, "Tutor fetched successfully"));
};
var updateTutorProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { bio, hourlyRate, experience, teachingMethod, headline, categories } = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (bio === void 0 && hourlyRate === void 0 && experience === void 0 && teachingMethod === void 0 && headline === void 0 && categories === void 0) {
      return res.status(400).json({ message: "At least one field is required" });
    }
    const updatedProfile = await tutorService.updateProfile(userId, {
      bio,
      hourlyRate,
      experience,
      teachingMethod,
      headline,
      categories
    });
    if (!updatedProfile)
      return res.status(404).json({ message: "Profile not found" });
    return res.status(200).json(sendSuccess(updatedProfile, "Profile updated successfully"));
  } catch (error) {
    next(error);
  }
};
var getMyProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const profile = await tutorService.getProfileByUserId(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(sendSuccess(profile, "Tutor profile fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var tutorController = {
  createTutorProfile,
  updateTutorProfile,
  getAllTutors: getAllTutors2,
  getTutorById: getTutorById2,
  getMyProfile
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
        status: session.user.status || "ACTIVE" /* ACTIVE */,
        emailVerified: session.user.emailVerified
      };
      if (req.user.status !== "ACTIVE" /* ACTIVE */) {
        return res.status(403).json({
          success: false,
          message: "Your account is not active."
        });
      }
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

// src/modules/ai/ai.validation.ts
import { z } from "zod";
var recommendationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(6).default(4)
});
var reviewInsightsParamsSchema = z.object({
  id: z.string().trim().min(1, "Tutor ID is required.")
});
var sentimentPayloadSchema = z.object({
  text: z.string().trim().min(3).max(2e3)
});
var chatHistoryEntrySchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(500)
});
var chatPayloadSchema = z.object({
  message: z.string().trim().min(1).max(500),
  history: z.array(chatHistoryEntrySchema).max(10).optional()
});
var getValidationMessage = (error) => {
  return error.issues.map((issue) => issue.message).join(", ");
};

// src/modules/ai/ai.service.ts
var recommendationWeights = {
  categoryMatch: 0.32,
  rating: 0.24,
  reviewCount: 0.12,
  affordability: 0.14,
  interestHistory: 0.12,
  verification: 0.06
};
var huggingFaceModel = "cardiffnlp/twitter-roberta-base-sentiment-latest";
var defaultQuickActions = [
  {
    label: "Find Tutor",
    message: "Find me a tutor for math with strong reviews."
  },
  {
    label: "Booking Help",
    message: "How do I book or manage a tutoring session?"
  },
  {
    label: "Become a Tutor",
    message: "How can I register as a tutor on SkillBridge?"
  },
  {
    label: "Top Rated Tutors",
    message: "Show me top rated tutors."
  }
];
function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}
function round(value) {
  return Number(value.toFixed(3));
}
function normalizeTutor(tutor) {
  const tutorRecord = tutor;
  const { tutorCategories, ...rest } = tutorRecord;
  return {
    ...rest,
    categories: Array.isArray(tutorCategories) ? tutorCategories.map((item) => item.category) : []
  };
}
function normalizeAffordability(hourlyRate, minRate, maxRate) {
  if (maxRate <= minRate) {
    return 0.7;
  }
  return clamp(1 - (hourlyRate - minRate) / (maxRate - minRate));
}
function normalizeReviewCount(totalReviews, maxReviews) {
  if (maxReviews <= 0) {
    return totalReviews > 0 ? 0.5 : 0;
  }
  return clamp(Math.log1p(totalReviews) / Math.log1p(maxReviews));
}
async function getStudentSignals(studentId) {
  if (!studentId) {
    return {
      interestWeights: /* @__PURE__ */ new Map(),
      tutorHistoryWeights: /* @__PURE__ */ new Map(),
      interestCategories: [],
      personalized: false
    };
  }
  const bookings = await prisma.booking.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      category: true,
      tutor: {
        select: {
          id: true
        }
      }
    }
  });
  if (bookings.length === 0) {
    return {
      interestWeights: /* @__PURE__ */ new Map(),
      tutorHistoryWeights: /* @__PURE__ */ new Map(),
      interestCategories: [],
      personalized: false
    };
  }
  const interestWeights = /* @__PURE__ */ new Map();
  const tutorHistoryWeights = /* @__PURE__ */ new Map();
  bookings.forEach((booking, index) => {
    const recencyBoost = clamp(1.2 - index * 0.08, 0.6, 1.2);
    interestWeights.set(
      booking.category.id,
      (interestWeights.get(booking.category.id) ?? 0) + recencyBoost
    );
    tutorHistoryWeights.set(
      booking.tutor.id,
      (tutorHistoryWeights.get(booking.tutor.id) ?? 0) + recencyBoost
    );
  });
  const interestCategories = bookings.map((booking) => booking.category.name).filter((name, index, names) => names.indexOf(name) === index).slice(0, 3);
  return {
    interestWeights,
    tutorHistoryWeights,
    interestCategories,
    personalized: true
  };
}
function getCategoryMatchScore(tutor, interestWeights, personalized) {
  if (tutor.categories.length === 0) {
    return personalized ? 0 : 0.2;
  }
  if (!personalized || interestWeights.size === 0) {
    return 0.45;
  }
  const totalInterestWeight = [...interestWeights.values()].reduce(
    (sum, value) => sum + value,
    0
  );
  if (totalInterestWeight === 0) {
    return 0.45;
  }
  const matchedWeight = tutor.categories.reduce((sum, category) => {
    return sum + (interestWeights.get(category.id) ?? 0);
  }, 0);
  return clamp(matchedWeight / totalInterestWeight);
}
function getInterestHistoryScore(tutorId, tutorHistoryWeights, personalized) {
  if (!personalized || tutorHistoryWeights.size === 0) {
    return 0;
  }
  const maxHistoryWeight = Math.max(1, ...tutorHistoryWeights.values());
  return clamp((tutorHistoryWeights.get(tutorId) ?? 0) / maxHistoryWeight);
}
function getRecommendationLabel(tutor, personalized, categoryMatch, rating, affordability) {
  if (personalized && categoryMatch >= 0.5) {
    return "Recommended";
  }
  if (rating >= 0.9 || tutor.avgRating >= 4.7) {
    return "Top Rated";
  }
  if (affordability >= 0.72) {
    return "Best Value";
  }
  if (tutor.isVerified) {
    return "Verified";
  }
  return "Recommended";
}
function getRecommendationBadges(tutor, label, affordability) {
  const badges = [label];
  if (tutor.avgRating >= 4.7 && !badges.includes("Top Rated")) {
    badges.push("Top Rated");
  }
  if (affordability >= 0.72 && !badges.includes("Best Value")) {
    badges.push("Best Value");
  }
  if (tutor.isVerified && !badges.includes("Verified")) {
    badges.push("Verified");
  }
  return badges.slice(0, 3);
}
function buildRecommendationReason(tutor, personalized, interestCategories, label) {
  if (personalized && interestCategories.length > 0) {
    const matchedCategories = tutor.categories.map((category) => category.name).filter((name) => interestCategories.includes(name)).slice(0, 2);
    if (matchedCategories.length > 0) {
      return `Matches recent interest in ${matchedCategories.join(" and ")}.`;
    }
  }
  if (label === "Top Rated") {
    return `Strong rating momentum with ${tutor.totalReviews} student reviews.`;
  }
  if (label === "Best Value") {
    return `Competitive hourly rate for a ${tutor.avgRating.toFixed(1)} rated tutor.`;
  }
  if (tutor.isVerified) {
    return "Verified profile with reliable learner feedback.";
  }
  return "Balanced mix of reviews, rating, and affordability.";
}
function buildRecommendationEntry(tutor, context) {
  const normalizedTutor = normalizeTutor(tutor);
  const categoryMatch = getCategoryMatchScore(
    normalizedTutor,
    context.interestWeights,
    context.personalized
  );
  const rating = clamp(normalizedTutor.avgRating / 5);
  const reviewCount = normalizeReviewCount(
    normalizedTutor.totalReviews,
    context.maxReviews
  );
  const affordability = normalizeAffordability(
    normalizedTutor.hourlyRate,
    context.minRate,
    context.maxRate
  );
  const interestHistory = getInterestHistoryScore(
    normalizedTutor.id,
    context.tutorHistoryWeights,
    context.personalized
  );
  const verification = normalizedTutor.isVerified ? 1 : 0;
  const score = context.personalized ? categoryMatch * recommendationWeights.categoryMatch + rating * recommendationWeights.rating + reviewCount * recommendationWeights.reviewCount + affordability * recommendationWeights.affordability + interestHistory * recommendationWeights.interestHistory + verification * recommendationWeights.verification : rating * 0.46 + reviewCount * 0.22 + affordability * 0.22 + verification * 0.1;
  const label = getRecommendationLabel(
    normalizedTutor,
    context.personalized,
    categoryMatch,
    rating,
    affordability
  );
  return {
    tutor: normalizedTutor,
    score: round(score),
    label,
    badges: getRecommendationBadges(normalizedTutor, label, affordability),
    reason: buildRecommendationReason(
      normalizedTutor,
      context.personalized,
      context.interestCategories,
      label
    ),
    breakdown: {
      categoryMatch: round(categoryMatch),
      rating: round(rating),
      reviewCount: round(reviewCount),
      affordability: round(affordability),
      interestHistory: round(interestHistory),
      verification: round(verification)
    }
  };
}
async function getTutorRecommendations(limit = 4, studentId) {
  const safeLimit = Math.max(1, Math.min(limit, 6));
  const [tutorsResult, studentSignals] = await Promise.all([
    tutorService.getAllTutors({
      limit: 24,
      sortBy: "avgRating",
      sortOrder: "desc"
    }),
    getStudentSignals(studentId)
  ]);
  const tutors = tutorsResult.data ?? [];
  const minRate = Math.min(0, ...tutors.map((tutor) => tutor.hourlyRate));
  const maxRate = Math.max(0, ...tutors.map((tutor) => tutor.hourlyRate));
  const maxReviews = Math.max(0, ...tutors.map((tutor) => tutor.totalReviews));
  const items = tutors.map(
    (tutor) => buildRecommendationEntry(tutor, {
      minRate,
      maxRate,
      maxReviews,
      interestWeights: studentSignals.interestWeights,
      tutorHistoryWeights: studentSignals.tutorHistoryWeights,
      interestCategories: studentSignals.interestCategories,
      personalized: studentSignals.personalized
    })
  ).sort((left, right) => right.score - left.score).slice(0, safeLimit);
  return {
    items,
    meta: {
      strategy: studentSignals.personalized ? "personalized" : "popular",
      interestCategories: studentSignals.interestCategories,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}
function normalizeSentimentLabel(label) {
  const normalized = label?.toLowerCase().trim();
  if (!normalized) {
    return null;
  }
  if (normalized.includes("positive") || normalized === "label_2" || normalized.endsWith("_2")) {
    return "positive";
  }
  if (normalized.includes("neutral") || normalized === "label_1" || normalized.endsWith("_1")) {
    return "neutral";
  }
  if (normalized.includes("negative") || normalized === "label_0" || normalized.endsWith("_0")) {
    return "negative";
  }
  return null;
}
function extractPredictionRows(payload) {
  if (!Array.isArray(payload)) {
    return [];
  }
  if (Array.isArray(payload[0])) {
    return payload[0];
  }
  return payload;
}
function fallbackSentiment(text) {
  const normalized = text.toLowerCase();
  const positiveWords = [
    "great",
    "excellent",
    "helpful",
    "clear",
    "patient",
    "amazing",
    "good",
    "friendly",
    "strong",
    "recommend",
    "best",
    "supportive"
  ];
  const negativeWords = [
    "bad",
    "poor",
    "confusing",
    "late",
    "rude",
    "slow",
    "boring",
    "waste",
    "unclear",
    "disappointed",
    "problem",
    "difficult"
  ];
  const positiveScore = positiveWords.reduce((score, word) => {
    return normalized.includes(word) ? score + 1 : score;
  }, 0);
  const negativeScore = negativeWords.reduce((score, word) => {
    return normalized.includes(word) ? score + 1 : score;
  }, 0);
  if (positiveScore === negativeScore) {
    return {
      label: "neutral",
      score: 0.58,
      provider: "fallback"
    };
  }
  const label = positiveScore > negativeScore ? "positive" : "negative";
  const spread = Math.abs(positiveScore - negativeScore);
  return {
    label,
    score: round(clamp(0.62 + spread * 0.08)),
    provider: "fallback"
  };
}
async function runHuggingFaceSentiment(text) {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return null;
  }
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${huggingFaceModel}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          top_k: 3
        }
      }),
      signal: AbortSignal.timeout(9e3)
    }
  );
  if (!response.ok) {
    throw new Error(`Hugging Face request failed with ${response.status}`);
  }
  const payload = await response.json();
  const predictions = extractPredictionRows(payload);
  if (predictions.length === 0) {
    return null;
  }
  const bestPrediction = predictions.map((prediction) => ({
    label: normalizeSentimentLabel(prediction.label),
    score: typeof prediction.score === "number" ? prediction.score : 0
  })).filter(
    (prediction) => Boolean(prediction.label)
  ).sort((left, right) => right.score - left.score)[0];
  if (!bestPrediction) {
    return null;
  }
  return {
    label: bestPrediction.label,
    score: round(bestPrediction.score),
    provider: "huggingface"
  };
}
async function classifySentiment(text) {
  const normalizedText = text.trim();
  if (!normalizedText) {
    return {
      label: "neutral",
      score: 1,
      provider: "fallback"
    };
  }
  try {
    const huggingFaceResult = await runHuggingFaceSentiment(normalizedText);
    if (huggingFaceResult) {
      return huggingFaceResult;
    }
  } catch {
  }
  return fallbackSentiment(normalizedText);
}
function buildRatingFallback(averageRating, totalReviews) {
  if (totalReviews === 0) {
    return {
      positive: 0,
      neutral: 0,
      negative: 0
    };
  }
  if (averageRating >= 4.5) {
    return {
      positive: 76,
      neutral: 18,
      negative: 6
    };
  }
  if (averageRating >= 3.5) {
    return {
      positive: 48,
      neutral: 36,
      negative: 16
    };
  }
  return {
    positive: 22,
    neutral: 28,
    negative: 50
  };
}
function buildInsightSummary(averageRating, totalReviews, analyzedReviews, sentiment, usedFallbackOnly) {
  if (totalReviews === 0) {
    return "No reviews are available yet, so AI insights will appear after the first few student comments.";
  }
  if (analyzedReviews === 0) {
    return `Written feedback is limited right now, so this snapshot leans on the ${averageRating.toFixed(1)} star average across ${totalReviews} reviews.`;
  }
  if (sentiment.positive >= 65) {
    return `Student feedback trends strongly positive, which lines up with the ${averageRating.toFixed(1)} average rating. ${usedFallbackOnly ? "A local sentiment fallback generated this summary." : "The strongest themes point to clarity, patience, and session quality."}`;
  }
  if (sentiment.negative >= 30) {
    return `Feedback is mixed, with a noticeable share of negative comments despite a ${averageRating.toFixed(1)} average rating. This tutor may need tighter consistency across sessions.`;
  }
  return "Reviews are broadly balanced with a slight positive lean. Students see value in the sessions, but the written feedback is more measured than enthusiastic.";
}
async function getTutorReviewInsights(tutorId) {
  const tutor = await tutorService.getTutorById(tutorId);
  if (!tutor) {
    return null;
  }
  const reviewComments = (tutor.reviews ?? []).map((review) => review.comment?.trim() ?? "").filter((comment) => comment.length > 0).slice(0, 12);
  if (reviewComments.length === 0) {
    const sentiment2 = buildRatingFallback(tutor.avgRating, tutor.totalReviews);
    return {
      tutorId,
      sentiment: sentiment2,
      summary: buildInsightSummary(
        tutor.avgRating,
        tutor.totalReviews,
        0,
        sentiment2,
        true
      ),
      totalReviews: tutor.totalReviews,
      analyzedReviews: 0,
      averageRating: tutor.avgRating,
      provider: tutor.totalReviews > 0 ? "fallback" : "unavailable"
    };
  }
  const classifications = await Promise.all(
    reviewComments.map((comment) => classifySentiment(comment))
  );
  const counts = classifications.reduce(
    (summary, classification) => {
      summary[classification.label] += 1;
      return summary;
    },
    {
      positive: 0,
      neutral: 0,
      negative: 0
    }
  );
  const total = classifications.length;
  const sentiment = {
    positive: Math.round(counts.positive / total * 100),
    neutral: Math.round(counts.neutral / total * 100),
    negative: Math.round(counts.negative / total * 100)
  };
  const distributedTotal = sentiment.positive + sentiment.neutral + sentiment.negative;
  if (distributedTotal !== 100) {
    sentiment.neutral += 100 - distributedTotal;
  }
  const providers = new Set(classifications.map((item) => item.provider));
  const provider = providers.size > 1 ? "mixed" : providers.has("huggingface") ? "huggingface" : "fallback";
  return {
    tutorId,
    sentiment,
    summary: buildInsightSummary(
      tutor.avgRating,
      tutor.totalReviews,
      total,
      sentiment,
      provider === "fallback"
    ),
    totalReviews: tutor.totalReviews,
    analyzedReviews: total,
    averageRating: tutor.avgRating,
    provider
  };
}
function extractBudget(message) {
  const match = message.match(
    /(?:under|below|max|budget)\s*(?:bdt|tk|taka|৳)?\s*(\d{2,5})/i
  );
  return match ? Number(match[1]) : void 0;
}
function extractMinRating(message) {
  const match = message.match(/(\d(?:\.\d)?)\s*(?:stars?|rating)/i);
  return match ? Number(match[1]) : void 0;
}
function detectIntent(message, matchedCategoryName, budget) {
  if (/(become a tutor|register as a tutor|join as tutor|teach on skillbridge)/i.test(
    message
  )) {
    return "tutor_registration_help";
  }
  if (/(book|booking|cancel|reschedule|availability|session)/i.test(message)) {
    return "booking_help";
  }
  if (matchedCategoryName) {
    return "category_filter";
  }
  if (budget || /(cheap|affordable|price|pricing|budget)/i.test(message)) {
    return "pricing_filter";
  }
  if (/(find|need|search|show|top rated|best tutor|recommend)/i.test(message)) {
    return "tutor_search";
  }
  return "general_help";
}
function buildTutorSuggestion(tutor, label, reason) {
  return {
    tutor: Array.isArray(tutor.categories) ? tutor : normalizeTutor(tutor),
    label,
    reason
  };
}
function buildQuickActions(intent) {
  if (intent === "booking_help") {
    return [
      {
        label: "Browse Tutors",
        message: "Show me top rated tutors."
      },
      {
        label: "View Pricing",
        message: "Find affordable tutors under \u09F31200."
      },
      ...defaultQuickActions.slice(2)
    ];
  }
  if (intent === "tutor_registration_help") {
    return [
      {
        label: "Tutor Profile Tips",
        message: "What should I include in my tutor profile?"
      },
      ...defaultQuickActions.slice(0, 3)
    ];
  }
  return defaultQuickActions;
}
function buildSearchReply(tutorCount, budget, categoryName, intent) {
  if (tutorCount === 0) {
    if (intent === "pricing_filter" && budget) {
      return `I could not find a strong tutor match under \u09F3${budget}. Try raising the budget slightly or removing one filter.`;
    }
    if (categoryName) {
      return `I could not find a strong ${categoryName} tutor match right now. Try removing the budget filter or asking for top rated tutors.`;
    }
    return "I could not find a matching tutor yet. Try adding a subject, budget, or rating preference.";
  }
  if (categoryName && budget) {
    return `I found ${tutorCount} ${categoryName} tutor matches under \u09F3${budget}. These balance rating, reviews, and price.`;
  }
  if (categoryName) {
    return `I found ${tutorCount} ${categoryName} tutors that look like good fits. The list favors stronger ratings and student feedback.`;
  }
  if (budget) {
    return `I found ${tutorCount} tutors within that price range. I sorted the suggestions toward better value first.`;
  }
  return `Here are ${tutorCount} tutor suggestions based on your request.`;
}
async function getMatchedCategory(message) {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" }
  });
  return categories.find(
    (category) => message.includes(category.name.toLowerCase())
  );
}
async function getAssistantResponse(payload) {
  const normalizedMessage = payload.message.trim().toLowerCase();
  const matchedCategory = await getMatchedCategory(normalizedMessage);
  const budget = extractBudget(normalizedMessage);
  const minRating = extractMinRating(normalizedMessage);
  const intent = detectIntent(normalizedMessage, matchedCategory?.name, budget);
  if (intent === "booking_help") {
    return {
      intent,
      reply: "To book a session, open a tutor profile, choose a listed slot, and confirm the booking. To manage changes later, use the Bookings page in your dashboard.",
      quickActions: buildQuickActions(intent)
    };
  }
  if (intent === "tutor_registration_help") {
    return {
      intent,
      reply: "Register from the main sign-up page, choose the tutor path, then complete your tutor profile with your bio, hourly rate, categories, and weekly availability. A stronger profile usually converts better.",
      quickActions: buildQuickActions(intent)
    };
  }
  if (intent === "general_help") {
    const recommendations = await getTutorRecommendations(3);
    return {
      intent,
      reply: "I can help you find tutors, compare pricing, explain bookings, or guide tutor registration. Start with a subject, price range, or rating target.",
      tutorSuggestions: recommendations?.items.map(
        (item) => buildTutorSuggestion(item.tutor, item.label, item.reason)
      ) ?? [],
      quickActions: buildQuickActions(intent)
    };
  }
  const filters = {
    limit: 4,
    sortBy: intent === "pricing_filter" ? "hourlyRate" : "avgRating",
    sortOrder: intent === "pricing_filter" ? "asc" : "desc"
  };
  if (matchedCategory) {
    filters.categoryId = matchedCategory.id;
  }
  if (budget) {
    filters.maxPrice = budget;
  }
  if (minRating) {
    filters.minRating = minRating;
  }
  if (normalizedMessage.includes("top rated")) {
    filters.sortBy = "avgRating";
    filters.sortOrder = "desc";
  }
  const tutorResults = await tutorService.getAllTutors(filters);
  const tutors = tutorResults.data.slice(0, 4);
  return {
    intent,
    reply: buildSearchReply(
      tutors.length,
      budget,
      matchedCategory?.name,
      intent
    ),
    tutorSuggestions: tutors.map(
      (tutor) => buildTutorSuggestion(
        tutor,
        tutor.avgRating >= 4.7 ? "Top Rated" : tutor.hourlyRate <= (budget ?? tutor.hourlyRate) ? "Best Value" : "Recommended",
        matchedCategory ? `Strong ${matchedCategory.name} profile with a ${tutor.avgRating.toFixed(1)} rating.` : `Rated ${tutor.avgRating.toFixed(1)} with ${tutor.totalReviews} reviews.`
      )
    ),
    quickActions: buildQuickActions(intent),
    filters
  };
}

// src/modules/ai/ai.controller.ts
async function getOptionalUserId(req) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}
var getRecommendations = async (req, res, next) => {
  try {
    const parsedQuery = recommendationQuerySchema.safeParse(req.query);
    if (!parsedQuery.success) {
      return res.status(400).json({
        success: false,
        message: getValidationMessage(parsedQuery.error)
      });
    }
    const userId = await getOptionalUserId(req);
    const recommendations = await getTutorRecommendations(
      parsedQuery.data.limit,
      userId
    );
    return res.status(200).json(sendSuccess(recommendations, "Tutor recommendations fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getReviewInsights = async (req, res, next) => {
  try {
    const parsedParams = reviewInsightsParamsSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return res.status(400).json({
        success: false,
        message: getValidationMessage(parsedParams.error)
      });
    }
    const insights = await getTutorReviewInsights(parsedParams.data.id);
    if (!insights) {
      return res.status(404).json({
        success: false,
        message: "Tutor not found"
      });
    }
    return res.status(200).json(sendSuccess(insights, "AI review insights fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var classifyReviewSentiment = async (req, res, next) => {
  try {
    const parsedBody = sentimentPayloadSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: getValidationMessage(parsedBody.error)
      });
    }
    const normalizedText = parsedBody.data.text.trim();
    const sentiment = await classifySentiment(normalizedText);
    return res.status(200).json(
      sendSuccess(
        {
          sentiment,
          normalizedText
        },
        "Sentiment analyzed successfully"
      )
    );
  } catch (error) {
    next(error);
  }
};
var chat = async (req, res, next) => {
  try {
    const parsedBody = chatPayloadSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: getValidationMessage(parsedBody.error)
      });
    }
    const reply = await getAssistantResponse({
      message: parsedBody.data.message,
      ...parsedBody.data.history ? { history: parsedBody.data.history } : {}
    });
    return res.status(200).json(sendSuccess(reply, "Assistant response generated successfully"));
  } catch (error) {
    next(error);
  }
};
var aiController = {
  getRecommendations,
  getReviewInsights,
  classifyReviewSentiment,
  chat
};

// src/modules/tutor/tutor.routes.ts
var router = express.Router();
router.post("/", auth_default("TUTOR" /* TUTOR */), tutorController.createTutorProfile);
router.get("/", tutorController.getAllTutors);
router.get("/recommendations", aiController.getRecommendations);
router.get(
  "/my-profile",
  auth_default("TUTOR" /* TUTOR */),
  tutorController.getMyProfile
);
router.put(
  "/profile",
  auth_default("TUTOR" /* TUTOR */),
  tutorController.updateTutorProfile
);
router.get("/:id/review-insights", aiController.getReviewInsights);
router.get("/:id", tutorController.getTutorById);
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
    orderBy: { sessionDate: "desc" },
    include: {
      student: true,
      tutor: { include: { user: true } },
      category: true
    }
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
    data: {
      status: BookingStatus.CANCELLED,
      availabilityId: null
    }
  });
  if (booking.availabilityId) {
    await prisma.availability.update({
      where: { id: booking.availabilityId },
      data: { isBooked: false }
    });
  }
  return updatedBooking;
};
var completeBooking = async (bookingId, userId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tutor: true }
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.studentId !== userId && booking.tutor.userId !== userId) {
    throw new Error("Unauthorized to complete this booking");
  }
  if (booking.status !== BookingStatus.CONFIRMED) {
    throw new Error("Only confirmed bookings can be completed");
  }
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.COMPLETED }
  });
  return updatedBooking;
};
var bookingService = {
  createBooking,
  getAllBookings,
  getStudentBookings,
  getTutorBookings,
  cancelBooking,
  completeBooking
};

// src/modules/booking/booking.controller.ts
var createBooking2 = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking({
      ...req.body,
      studentId: req.user.id
    });
    res.status(201).json(sendSuccess(booking, "Booking created successfully"));
  } catch (error) {
    next(error);
  }
};
var getAllBookings2 = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(sendSuccess(bookings, "Bookings fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getStudentBookings(req.user.id);
    res.json(sendSuccess(bookings, "My bookings fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getTutorSessions = async (req, res, next) => {
  try {
    const bookings = await bookingService.getTutorBookings(req.user.id);
    res.json(sendSuccess(bookings, "Tutor sessions fetched successfully"));
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
    res.json(sendSuccess(booking, "Booking cancelled successfully"));
  } catch (error) {
    next(error);
  }
};
var completeSession = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid booking ID" });
    }
    const booking = await bookingService.completeBooking(id, req.user.id);
    res.json(sendSuccess(booking, "Session marked as complete"));
  } catch (error) {
    next(error);
  }
};
var bookingController = {
  createBooking: createBooking2,
  getAllBookings: getAllBookings2,
  getMyBookings,
  getTutorSessions,
  cancelMyBooking,
  completeSession
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
router2.patch(
  "/:id/complete",
  auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  bookingController.completeSession
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
    res.status(201).json(sendSuccess(slot, "Availability created successfully"));
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
    res.json(sendSuccess(slots, "Availability fetched successfully"));
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
    res.json(sendSuccess(slot, "Availability removed"));
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
var getMyReviews = async (studentId) => {
  return prisma.review.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: {
      booking: true,
      tutor: {
        include: {
          user: true
        }
      }
    }
  });
};
var getTutorReviews = async (userId) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  return prisma.review.findMany({
    where: { tutorProfileId: tutorProfile.id },
    orderBy: { createdAt: "desc" },
    include: {
      student: true,
      booking: true
    }
  });
};
var reviewService = {
  createReview,
  getMyReviews,
  getTutorReviews
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
var getMyReviews2 = async (req, res, next) => {
  try {
    const reviews = await reviewService.getMyReviews(req.user.id);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};
var getTutorReviews2 = async (req, res, next) => {
  try {
    const reviews = await reviewService.getTutorReviews(req.user.id);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};
var reviewController = {
  createReview: createReview2,
  getMyReviews: getMyReviews2,
  getTutorReviews: getTutorReviews2
};

// src/modules/review/review.routes.ts
var router5 = express3.Router();
router5.post("/", auth_default("STUDENT" /* STUDENT */), reviewController.createReview);
router5.get("/me", auth_default("STUDENT" /* STUDENT */), reviewController.getMyReviews);
router5.get("/tutor/me", auth_default("TUTOR" /* TUTOR */), reviewController.getTutorReviews);
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
    return res.status(200).json(sendSuccess(result, "Current user fetched"));
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
  auth_default(
    "STUDENT" /* STUDENT */,
    "TUTOR" /* TUTOR */,
    "ADMIN" /* ADMIN */,
    "MODERATOR" /* MODERATOR */,
    "SUPPORT_MANAGER" /* SUPPORT_MANAGER */
  ),
  authController.getCurrentUser
);
var authRouter = router6;

// src/modules/admin/admin.routes.ts
import express5 from "express";

// src/modules/admin/admin.service.ts
var getAllUsers = async (page = 1, limit = 10, role) => {
  const skip = (page - 1) * limit;
  const where = role ? { role } : void 0;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        tutorProfile: true
      }
    }),
    prisma.user.count({ where })
  ]);
  return {
    users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var updateUserStatus = async (id, status) => {
  return prisma.user.update({
    where: { id },
    data: { status }
  });
};
var getAllTutors3 = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [tutors, total] = await Promise.all([
    prisma.tutorProfile.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: true,
        tutorCategories: {
          include: { category: true }
        }
      }
    }),
    prisma.tutorProfile.count()
  ]);
  return {
    tutors,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var updateTutorVerification = async (id, isVerified) => {
  return prisma.tutorProfile.update({
    where: { id },
    data: { isVerified },
    include: {
      user: true,
      tutorCategories: {
        include: { category: true }
      }
    }
  });
};
var createStaffUser = async (data) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() }
  });
  if (existingUser) {
    throw new Error("User already exists with this email");
  }
  const context = await auth.$context;
  const hashedPassword = await context.password.hash(data.password);
  const createdUser = await context.internalAdapter.createUser({
    email: data.email.toLowerCase(),
    name: data.name,
    image: data.image,
    phone: data.phone,
    role: data.role,
    status: "ACTIVE",
    emailVerified: true
  });
  if (!createdUser) {
    throw new Error("Failed to create staff user");
  }
  await context.internalAdapter.linkAccount({
    userId: createdUser.id,
    providerId: "credential",
    accountId: createdUser.id,
    password: hashedPassword
  });
  return { user: createdUser };
};
var getPlatformStats = async () => {
  const [
    totalUsers,
    totalTutors,
    totalStudents,
    totalBookings,
    activeCategories,
    pendingReports,
    openTickets
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "TUTOR" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.booking.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.supportTicket.count({ where: { status: "OPEN" } })
  ]);
  return {
    totalUsers,
    totalTutors,
    totalStudents,
    totalBookings,
    activeCategories,
    pendingReports,
    openTickets
  };
};
var adminService = {
  getAllUsers,
  updateUserStatus,
  getAllTutors: getAllTutors3,
  updateTutorVerification,
  createStaffUser,
  getPlatformStats
};

// src/modules/admin/admin.controller.ts
var getAllUsers2 = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const role = typeof req.query.role === "string" ? req.query.role : void 0;
    const result = await adminService.getAllUsers(page, limit, role);
    return res.status(200).json(sendSuccess(result.users, "Users fetched successfully", result.meta));
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
    return res.status(200).json(sendSuccess(updatedUser, "User status updated successfully"));
  } catch (error) {
    next(error);
  }
};
var createStaffUser2 = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, image } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "name, email, password, and role are required"
      });
    }
    if (role !== "MODERATOR" /* MODERATOR */ && role !== "SUPPORT_MANAGER" /* SUPPORT_MANAGER */) {
      return res.status(400).json({
        message: "Admin can only create MODERATOR or SUPPORT_MANAGER accounts"
      });
    }
    const result = await adminService.createStaffUser({
      name,
      email,
      password,
      role,
      phone,
      image
    });
    return res.status(201).json(sendSuccess(result.user, "Staff account created successfully"));
  } catch (error) {
    next(error);
  }
};
var getPlatformStats2 = async (_req, res, next) => {
  try {
    const stats = await adminService.getPlatformStats();
    return res.status(200).json(sendSuccess(stats, "Platform stats fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getAllTutors4 = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await adminService.getAllTutors(page, limit);
    return res.status(200).json(sendSuccess(result.tutors, "Tutors fetched successfully", result.meta));
  } catch (error) {
    next(error);
  }
};
var updateTutorVerification2 = async (req, res, next) => {
  try {
    const { isVerified } = req.body;
    if (typeof isVerified !== "boolean") {
      return res.status(400).json({ message: "isVerified must be a boolean" });
    }
    const tutor = await adminService.updateTutorVerification(
      req.params.id,
      isVerified
    );
    return res.status(200).json(sendSuccess(tutor, "Tutor verification updated successfully"));
  } catch (error) {
    next(error);
  }
};
var adminController = {
  getAllUsers: getAllUsers2,
  updateUserStatus: updateUserStatus2,
  createStaffUser: createStaffUser2,
  getPlatformStats: getPlatformStats2,
  getAllTutors: getAllTutors4,
  updateTutorVerification: updateTutorVerification2
};

// src/modules/admin/admin.routes.ts
var router7 = express5.Router();
router7.get("/stats", auth_default("ADMIN" /* ADMIN */), adminController.getPlatformStats);
router7.get("/users", auth_default("ADMIN" /* ADMIN */), adminController.getAllUsers);
router7.get("/tutors", auth_default("ADMIN" /* ADMIN */), adminController.getAllTutors);
router7.post("/staff", auth_default("ADMIN" /* ADMIN */), adminController.createStaffUser);
router7.patch(
  "/tutors/:id/verify",
  auth_default("ADMIN" /* ADMIN */),
  adminController.updateTutorVerification
);
router7.patch(
  "/users/:id",
  auth_default("ADMIN" /* ADMIN */),
  adminController.updateUserStatus
);
var adminRouter = router7;

// src/modules/report/report.routes.ts
import { Router as Router8 } from "express";

// src/modules/report/report.service.ts
var createReport = async (data) => {
  if (data.targetType === ReportTargetType.REVIEW) {
    const review = await prisma.review.findUnique({
      where: { id: data.targetId }
    });
    if (!review) {
      throw new Error("Review not found");
    }
    return prisma.report.create({
      data: {
        reporterId: data.reporterId,
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason,
        details: data.details,
        reviewId: review.id
      }
    });
  }
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { id: data.targetId }
  });
  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }
  return prisma.report.create({
    data: {
      reporterId: data.reporterId,
      targetType: data.targetType,
      targetId: data.targetId,
      reason: data.reason,
      details: data.details,
      tutorProfileId: tutorProfile.id
    }
  });
};
var getMyReports = async (reporterId) => {
  return prisma.report.findMany({
    where: { reporterId },
    orderBy: { createdAt: "desc" },
    include: {
      review: true,
      tutorProfile: {
        include: {
          user: true
        }
      },
      moderator: true
    }
  });
};
var getAllReports = async () => {
  return prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reporter: true,
      moderator: true,
      review: {
        include: {
          student: true,
          tutor: {
            include: {
              user: true
            }
          }
        }
      },
      tutorProfile: {
        include: {
          user: true,
          tutorCategories: {
            include: { category: true }
          }
        }
      },
      moderationActions: {
        include: {
          moderator: true
        }
      }
    }
  });
};
var getReportQueue = async (status, targetType) => {
  return prisma.report.findMany({
    where: {
      ...status ? { status } : {},
      ...targetType ? { targetType } : {}
    },
    orderBy: { createdAt: "desc" },
    include: {
      reporter: true,
      review: true,
      tutorProfile: {
        include: {
          user: true
        }
      },
      moderationActions: {
        include: {
          moderator: true
        }
      }
    }
  });
};
var getModerationActivityLog = async () => {
  return prisma.moderationAction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      moderator: true,
      report: true,
      review: true,
      tutorProfile: {
        include: {
          user: true
        }
      }
    }
  });
};
var moderateReport = async (reportId, data) => {
  return prisma.$transaction(async (tx) => {
    const report = await tx.report.findUnique({
      where: { id: reportId },
      include: {
        review: true,
        tutorProfile: true
      }
    });
    if (!report) {
      throw new Error("Report not found");
    }
    const updatedReport = await tx.report.update({
      where: { id: reportId },
      data: {
        status: data.status,
        decisionNote: data.decisionNote,
        moderatorId: data.moderatorId
      }
    });
    if (data.actionType === ModerationActionType.HIDE_REVIEW && report.reviewId) {
      await tx.review.update({
        where: { id: report.reviewId },
        data: {
          isHidden: true,
          moderationStatus: ModerationStatus.HIDDEN
        }
      });
    }
    if (data.actionType === ModerationActionType.APPROVE_REVIEW && report.reviewId) {
      await tx.review.update({
        where: { id: report.reviewId },
        data: {
          isHidden: false,
          moderationStatus: ModerationStatus.APPROVED
        }
      });
    }
    if (data.actionType === ModerationActionType.FLAG_TUTOR_PROFILE && report.tutorProfileId) {
      await tx.tutorProfile.update({
        where: { id: report.tutorProfileId },
        data: { isVerified: false }
      });
    }
    if (data.actionType === ModerationActionType.CLEAR_TUTOR_PROFILE && report.tutorProfileId) {
      await tx.tutorProfile.update({
        where: { id: report.tutorProfileId },
        data: { isVerified: true }
      });
    }
    if (data.actionType) {
      await tx.moderationAction.create({
        data: {
          reportId,
          moderatorId: data.moderatorId,
          actionType: data.actionType,
          note: data.decisionNote,
          reviewId: report.reviewId,
          tutorProfileId: report.tutorProfileId
        }
      });
    }
    return updatedReport;
  });
};
var reportService = {
  createReport,
  getMyReports,
  getAllReports,
  getReportQueue,
  getModerationActivityLog,
  moderateReport
};

// src/modules/report/report.controller.ts
var createReport2 = async (req, res, next) => {
  try {
    const report = await reportService.createReport({
      reporterId: req.user.id,
      targetType: req.body.targetType,
      targetId: req.body.targetId,
      reason: req.body.reason,
      details: req.body.details
    });
    return res.status(201).json(sendSuccess(report, "Report submitted successfully"));
  } catch (error) {
    next(error);
  }
};
var getMyReports2 = async (req, res, next) => {
  try {
    const reports = await reportService.getMyReports(req.user.id);
    return res.status(200).json(sendSuccess(reports, "My reports fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getAllReports2 = async (_req, res, next) => {
  try {
    const reports = await reportService.getAllReports();
    return res.status(200).json(sendSuccess(reports, "Reports fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getReportQueue2 = async (req, res, next) => {
  try {
    const reports = await reportService.getReportQueue(
      req.query.status,
      req.query.targetType
    );
    return res.status(200).json(sendSuccess(reports, "Report queue fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getModerationActivityLog2 = async (_req, res, next) => {
  try {
    const activityLog = await reportService.getModerationActivityLog();
    return res.status(200).json(sendSuccess(activityLog, "Moderation activity log fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var moderateReport2 = async (req, res, next) => {
  try {
    const report = await reportService.moderateReport(req.params.id, {
      moderatorId: req.user.id,
      status: req.body.status,
      decisionNote: req.body.decisionNote,
      actionType: req.body.actionType
    });
    return res.status(200).json(sendSuccess(report, "Report updated successfully"));
  } catch (error) {
    next(error);
  }
};
var reportController = {
  createReport: createReport2,
  getMyReports: getMyReports2,
  getAllReports: getAllReports2,
  getReportQueue: getReportQueue2,
  getModerationActivityLog: getModerationActivityLog2,
  moderateReport: moderateReport2
};

// src/modules/report/report.routes.ts
var router8 = Router8();
router8.post(
  "/",
  auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  reportController.createReport
);
router8.get(
  "/me",
  auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  reportController.getMyReports
);
router8.get(
  "/",
  auth_default("ADMIN" /* ADMIN */, "MODERATOR" /* MODERATOR */),
  reportController.getAllReports
);
router8.get(
  "/queue",
  auth_default("ADMIN" /* ADMIN */, "MODERATOR" /* MODERATOR */),
  reportController.getReportQueue
);
router8.get(
  "/activity-log",
  auth_default("ADMIN" /* ADMIN */, "MODERATOR" /* MODERATOR */),
  reportController.getModerationActivityLog
);
router8.patch(
  "/:id",
  auth_default("MODERATOR" /* MODERATOR */, "ADMIN" /* ADMIN */),
  reportController.moderateReport
);
var reportRouter = router8;

// src/modules/support/support.routes.ts
import { Router as Router9 } from "express";

// src/modules/support/support.service.ts
var createSupportTicket = async (data) => {
  return prisma.supportTicket.create({
    data: {
      userId: data.userId,
      subject: data.subject,
      message: data.message,
      type: data.type ?? SupportTicketType.GENERAL,
      priority: data.priority ?? TicketPriority.MEDIUM,
      bookingId: data.bookingId
    },
    include: {
      user: true,
      booking: true
    }
  });
};
var getMyTickets = async (userId) => {
  return prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: true,
      booking: true
    }
  });
};
var getAllTickets = async () => {
  return prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      assignedTo: true,
      booking: {
        include: {
          student: true,
          tutor: {
            include: {
              user: true
            }
          }
        }
      }
    }
  });
};
var getBookingIssues = async () => {
  return prisma.supportTicket.findMany({
    where: {
      type: {
        in: ["BOOKING_ISSUE", "CANCELLATION", "REFUND"]
      }
    },
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      assignedTo: true,
      booking: {
        include: {
          student: true,
          tutor: {
            include: {
              user: true
            }
          }
        }
      }
    }
  });
};
var updateTicket = async (ticketId, data) => {
  return prisma.supportTicket.update({
    where: { id: ticketId },
    data,
    include: {
      user: true,
      assignedTo: true,
      booking: true
    }
  });
};
var createContactRequest = async (data) => {
  return prisma.contactRequest.create({
    data
  });
};
var getAllContactRequests = async () => {
  return prisma.contactRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      handledBy: true
    }
  });
};
var getAssistanceLog = async () => {
  return prisma.supportTicket.findMany({
    where: {
      status: SupportTicketStatus.RESOLVED
    },
    orderBy: { updatedAt: "desc" },
    include: {
      user: true,
      assignedTo: true,
      booking: true
    }
  });
};
var updateContactRequest = async (id, data) => {
  return prisma.contactRequest.update({
    where: { id },
    data,
    include: {
      user: true,
      handledBy: true
    }
  });
};
var supportService = {
  createSupportTicket,
  getMyTickets,
  getAllTickets,
  getBookingIssues,
  updateTicket,
  createContactRequest,
  getAllContactRequests,
  getAssistanceLog,
  updateContactRequest
};

// src/modules/support/support.controller.ts
var createSupportTicket2 = async (req, res, next) => {
  try {
    const ticket = await supportService.createSupportTicket({
      userId: req.user.id,
      subject: req.body.subject,
      message: req.body.message,
      type: req.body.type,
      priority: req.body.priority,
      bookingId: req.body.bookingId
    });
    return res.status(201).json(sendSuccess(ticket, "Support ticket created successfully"));
  } catch (error) {
    next(error);
  }
};
var getMyTickets2 = async (req, res, next) => {
  try {
    const tickets = await supportService.getMyTickets(req.user.id);
    return res.status(200).json(sendSuccess(tickets, "My tickets fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getAllTickets2 = async (_req, res, next) => {
  try {
    const tickets = await supportService.getAllTickets();
    return res.status(200).json(sendSuccess(tickets, "Tickets fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getBookingIssues2 = async (_req, res, next) => {
  try {
    const tickets = await supportService.getBookingIssues();
    return res.status(200).json(sendSuccess(tickets, "Booking issues fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var updateTicket2 = async (req, res, next) => {
  try {
    const ticket = await supportService.updateTicket(req.params.id, {
      assignedToId: req.body.assignedToId ?? req.user.id,
      status: req.body.status,
      priority: req.body.priority,
      resolutionNote: req.body.resolutionNote
    });
    return res.status(200).json(sendSuccess(ticket, "Support ticket updated successfully"));
  } catch (error) {
    next(error);
  }
};
var createContactRequest2 = async (req, res, next) => {
  try {
    const contactRequest = await supportService.createContactRequest({
      userId: req.user?.id,
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message
    });
    return res.status(201).json(sendSuccess(contactRequest, "Contact request submitted successfully"));
  } catch (error) {
    next(error);
  }
};
var getAllContactRequests2 = async (_req, res, next) => {
  try {
    const contactRequests = await supportService.getAllContactRequests();
    return res.status(200).json(sendSuccess(contactRequests, "Contact requests fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getAssistanceLog2 = async (_req, res, next) => {
  try {
    const assistanceLog = await supportService.getAssistanceLog();
    return res.status(200).json(sendSuccess(assistanceLog, "Assistance log fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var updateContactRequest2 = async (req, res, next) => {
  try {
    const contactRequest = await supportService.updateContactRequest(
      req.params.id,
      {
        handledById: req.user.id,
        status: req.body.status,
        responseNote: req.body.responseNote
      }
    );
    return res.status(200).json(sendSuccess(contactRequest, "Contact request updated successfully"));
  } catch (error) {
    next(error);
  }
};
var supportController = {
  createSupportTicket: createSupportTicket2,
  getMyTickets: getMyTickets2,
  getAllTickets: getAllTickets2,
  getBookingIssues: getBookingIssues2,
  updateTicket: updateTicket2,
  createContactRequest: createContactRequest2,
  getAllContactRequests: getAllContactRequests2,
  getAssistanceLog: getAssistanceLog2,
  updateContactRequest: updateContactRequest2
};

// src/modules/support/support.routes.ts
var router9 = Router9();
router9.post(
  "/tickets",
  auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  supportController.createSupportTicket
);
router9.get(
  "/tickets/me",
  auth_default("STUDENT" /* STUDENT */, "TUTOR" /* TUTOR */),
  supportController.getMyTickets
);
router9.get(
  "/tickets",
  auth_default("SUPPORT_MANAGER" /* SUPPORT_MANAGER */, "ADMIN" /* ADMIN */),
  supportController.getAllTickets
);
router9.get(
  "/tickets/issues",
  auth_default("SUPPORT_MANAGER" /* SUPPORT_MANAGER */, "ADMIN" /* ADMIN */),
  supportController.getBookingIssues
);
router9.patch(
  "/tickets/:id",
  auth_default("SUPPORT_MANAGER" /* SUPPORT_MANAGER */, "ADMIN" /* ADMIN */),
  supportController.updateTicket
);
router9.post("/contact", supportController.createContactRequest);
router9.get(
  "/contact",
  auth_default("SUPPORT_MANAGER" /* SUPPORT_MANAGER */, "ADMIN" /* ADMIN */),
  supportController.getAllContactRequests
);
router9.get(
  "/assistance-log",
  auth_default("SUPPORT_MANAGER" /* SUPPORT_MANAGER */, "ADMIN" /* ADMIN */),
  supportController.getAssistanceLog
);
router9.patch(
  "/contact/:id",
  auth_default("SUPPORT_MANAGER" /* SUPPORT_MANAGER */, "ADMIN" /* ADMIN */),
  supportController.updateContactRequest
);
var supportRouter = router9;

// src/modules/user/user.routes.ts
import { Router as Router10 } from "express";

// src/modules/user/user.service.ts
var getMyProfile2 = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      tutorProfile: {
        include: {
          tutorCategories: { include: { category: true } }
        }
      }
    }
  });
};
var updateMyProfile = async (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...data.name !== void 0 ? { name: data.name } : {},
      ...data.phone !== void 0 ? { phone: data.phone } : {},
      ...data.image !== void 0 ? { image: data.image } : {}
    }
  });
};
var userService = {
  getMyProfile: getMyProfile2,
  updateMyProfile
};

// src/modules/user/user.controller.ts
var getMyProfile3 = async (req, res, next) => {
  try {
    const profile = await userService.getMyProfile(req.user.id);
    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(sendSuccess(profile, "Profile fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var updateMyProfile2 = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateMyProfile(req.user.id, req.body);
    return res.status(200).json(sendSuccess(updatedUser, "Profile updated successfully"));
  } catch (error) {
    next(error);
  }
};
var userController = {
  getMyProfile: getMyProfile3,
  updateMyProfile: updateMyProfile2
};

// src/modules/user/user.routes.ts
var router10 = Router10();
router10.get(
  "/me",
  auth_default(
    "STUDENT" /* STUDENT */,
    "TUTOR" /* TUTOR */,
    "ADMIN" /* ADMIN */,
    "MODERATOR" /* MODERATOR */,
    "SUPPORT_MANAGER" /* SUPPORT_MANAGER */
  ),
  userController.getMyProfile
);
router10.patch(
  "/me",
  auth_default(
    "STUDENT" /* STUDENT */,
    "TUTOR" /* TUTOR */,
    "ADMIN" /* ADMIN */,
    "MODERATOR" /* MODERATOR */,
    "SUPPORT_MANAGER" /* SUPPORT_MANAGER */
  ),
  userController.updateMyProfile
);
var userRouter = router10;

// src/modules/dashboard/dashboard.routes.ts
import { Router as Router11 } from "express";

// src/modules/dashboard/dashboard.service.ts
var getStudentDashboard = async (userId) => {
  const [totalBookings, upcomingSessions, cancelledSessions, completedSessions, recentBookings, recentReviews] = await Promise.all([
    prisma.booking.count({ where: { studentId: userId } }),
    prisma.booking.count({
      where: {
        studentId: userId,
        status: BookingStatus.CONFIRMED,
        sessionDate: { gte: /* @__PURE__ */ new Date() }
      }
    }),
    prisma.booking.count({
      where: { studentId: userId, status: BookingStatus.CANCELLED }
    }),
    prisma.booking.count({
      where: { studentId: userId, status: BookingStatus.COMPLETED }
    }),
    prisma.booking.findMany({
      where: { studentId: userId },
      orderBy: { sessionDate: "desc" },
      take: 5,
      include: {
        tutor: { include: { user: true } },
        category: true
      }
    }),
    prisma.review.findMany({
      where: { studentId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        tutor: { include: { user: true } }
      }
    })
  ]);
  return {
    summary: {
      totalBookings,
      upcomingSessions,
      cancelledSessions,
      completedSessions
    },
    recentBookings,
    recentReviews
  };
};
var getTutorDashboard = async (userId) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId }
  });
  if (!tutor) {
    throw new Error("Tutor profile not found");
  }
  const [totalSessions, upcomingSessions, completedSessions, averageRating, recentSessions, recentReviews] = await Promise.all([
    prisma.booking.count({ where: { tutorProfileId: tutor.id } }),
    prisma.booking.count({
      where: {
        tutorProfileId: tutor.id,
        status: BookingStatus.CONFIRMED,
        sessionDate: { gte: /* @__PURE__ */ new Date() }
      }
    }),
    prisma.booking.count({
      where: { tutorProfileId: tutor.id, status: BookingStatus.COMPLETED }
    }),
    prisma.review.aggregate({
      where: { tutorProfileId: tutor.id },
      _avg: { rating: true }
    }),
    prisma.booking.findMany({
      where: { tutorProfileId: tutor.id },
      orderBy: { sessionDate: "desc" },
      take: 5,
      include: {
        student: true,
        category: true
      }
    }),
    prisma.review.findMany({
      where: { tutorProfileId: tutor.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        student: true
      }
    })
  ]);
  return {
    summary: {
      totalSessions,
      upcomingSessions,
      completedSessions,
      averageRating: averageRating._avg.rating ?? 0
    },
    recentSessions,
    recentReviews
  };
};
var getModeratorDashboard = async () => {
  const [pendingReports, resolvedReports, hiddenReviews, flaggedTutorProfiles, latestReports, activityLog] = await Promise.all([
    prisma.report.count({ where: { status: ReportStatus.PENDING } }),
    prisma.report.count({ where: { status: ReportStatus.RESOLVED } }),
    prisma.review.count({ where: { isHidden: true } }),
    prisma.tutorProfile.count({ where: { isVerified: false } }),
    prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        reporter: true,
        moderator: true,
        review: true,
        tutorProfile: { include: { user: true } }
      }
    }),
    prisma.moderationAction.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        moderator: true,
        report: true,
        review: true,
        tutorProfile: { include: { user: true } }
      }
    })
  ]);
  return {
    summary: {
      pendingReports,
      resolvedReports,
      hiddenReviews,
      flaggedTutorProfiles
    },
    latestReports,
    activityLog
  };
};
var getSupportDashboard = async () => {
  const [openTickets, resolvedTickets, pendingBookingIssues, urgentIssues, recentTickets, assistanceLog, contactRequests] = await Promise.all([
    prisma.supportTicket.count({ where: { status: SupportTicketStatus.OPEN } }),
    prisma.supportTicket.count({
      where: { status: SupportTicketStatus.RESOLVED }
    }),
    prisma.supportTicket.count({
      where: {
        type: { in: ["BOOKING_ISSUE", "CANCELLATION", "REFUND"] },
        status: { not: SupportTicketStatus.RESOLVED }
      }
    }),
    prisma.supportTicket.count({
      where: {
        priority: "URGENT",
        status: { not: SupportTicketStatus.RESOLVED }
      }
    }),
    prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: true,
        assignedTo: true,
        booking: true
      }
    }),
    prisma.supportTicket.findMany({
      where: { status: SupportTicketStatus.RESOLVED },
      orderBy: { updatedAt: "desc" },
      take: 10,
      include: {
        user: true,
        assignedTo: true
      }
    }),
    prisma.contactRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        handledBy: true,
        user: true
      }
    })
  ]);
  return {
    summary: {
      openTickets,
      resolvedTickets,
      pendingBookingIssues,
      urgentIssues
    },
    recentTickets,
    assistanceLog,
    contactRequests
  };
};
var dashboardService = {
  getStudentDashboard,
  getTutorDashboard,
  getModeratorDashboard,
  getSupportDashboard
};

// src/modules/dashboard/dashboard.controller.ts
var getStudentDashboard2 = async (req, res, next) => {
  try {
    const data = await dashboardService.getStudentDashboard(req.user.id);
    return res.status(200).json(sendSuccess(data, "Student dashboard fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getTutorDashboard2 = async (req, res, next) => {
  try {
    const data = await dashboardService.getTutorDashboard(req.user.id);
    return res.status(200).json(sendSuccess(data, "Tutor dashboard fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getModeratorDashboard2 = async (_req, res, next) => {
  try {
    const data = await dashboardService.getModeratorDashboard();
    return res.status(200).json(sendSuccess(data, "Moderator dashboard fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var getSupportDashboard2 = async (_req, res, next) => {
  try {
    const data = await dashboardService.getSupportDashboard();
    return res.status(200).json(sendSuccess(data, "Support dashboard fetched successfully"));
  } catch (error) {
    next(error);
  }
};
var dashboardController = {
  getStudentDashboard: getStudentDashboard2,
  getTutorDashboard: getTutorDashboard2,
  getModeratorDashboard: getModeratorDashboard2,
  getSupportDashboard: getSupportDashboard2
};

// src/modules/dashboard/dashboard.routes.ts
var router11 = Router11();
router11.get(
  "/student",
  auth_default("STUDENT" /* STUDENT */),
  dashboardController.getStudentDashboard
);
router11.get(
  "/tutor",
  auth_default("TUTOR" /* TUTOR */),
  dashboardController.getTutorDashboard
);
router11.get(
  "/moderator",
  auth_default("MODERATOR" /* MODERATOR */),
  dashboardController.getModeratorDashboard
);
router11.get(
  "/support",
  auth_default("SUPPORT_MANAGER" /* SUPPORT_MANAGER */),
  dashboardController.getSupportDashboard
);
var dashboardRouter = router11;

// src/modules/ai/ai.routes.ts
import { Router as Router12 } from "express";
var router12 = Router12();
router12.post("/chat", aiController.chat);
router12.post("/sentiment", aiController.classifyReviewSentiment);
var aiRouter = router12;

// src/app.ts
var app = express6();
var allowedOrigins = [
  process.env.APP_URL,
  "http://localhost:3000",
  "http://localhost:3001"
].filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
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
app.use("/api/users", userRouter);
app.use("/api/reports", reportRouter);
app.use("/api/support", supportRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/ai", aiRouter);
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
