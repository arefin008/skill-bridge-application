-- CreateEnum
CREATE TYPE "UserRole" AS ENUM (
    'STUDENT',
    'TUTOR',
    'ADMIN',
    'MODERATOR',
    'SUPPORT_MANAGER'
);

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM (
    'ACTIVE',
    'BLOCKED',
    'SUSPENDED'
);

-- AlterTable
ALTER TABLE "user"
    ALTER COLUMN "role" DROP DEFAULT,
    ALTER COLUMN "status" DROP DEFAULT;

-- Normalize legacy values before enum cast
UPDATE "user"
SET "role" = CASE
    WHEN "role" IS NULL OR "role" = 'USER' THEN 'STUDENT'
    ELSE "role"
END;

UPDATE "user"
SET "status" = CASE
    WHEN "status" IS NULL THEN 'ACTIVE'
    ELSE "status"
END;

-- AlterTable
ALTER TABLE "user"
    ALTER COLUMN "role" TYPE "UserRole" USING ("role"::"UserRole"),
    ALTER COLUMN "role" SET DEFAULT 'STUDENT',
    ALTER COLUMN "status" TYPE "UserStatus" USING ("status"::"UserStatus"),
    ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
