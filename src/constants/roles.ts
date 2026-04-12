export enum UserRole {
  ADMIN = "ADMIN",
  TUTOR = "TUTOR",
  STUDENT = "STUDENT",
  MODERATOR = "MODERATOR",
  SUPPORT_MANAGER = "SUPPORT_MANAGER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  BLOCKED = "BLOCKED",
  SUSPENDED = "SUSPENDED",
}

export const dashboardRoles = [
  UserRole.STUDENT,
  UserRole.TUTOR,
  UserRole.ADMIN,
  UserRole.MODERATOR,
  UserRole.SUPPORT_MANAGER,
] as const;
