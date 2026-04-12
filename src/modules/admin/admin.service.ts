import { prisma } from "../../lib/prisma";
import { auth } from "../../lib/auth";
import { UserRole } from "../../constants/roles";

interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  role: UserRole.MODERATOR | UserRole.SUPPORT_MANAGER;
  phone?: string;
  image?: string;
}

const getAllUsers = async (
  page: number = 1,
  limit: number = 10,
  role?: string,
) => {
  const skip = (page - 1) * limit;
  const where = role ? { role } : undefined;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        tutorProfile: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateUserStatus = async (id: string, status: string) => {
  return prisma.user.update({
    where: { id },
    data: { status },
  });
};

const getAllTutors = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [tutors, total] = await Promise.all([
    prisma.tutorProfile.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: true,
        tutorCategories: {
          include: { category: true },
        },
      },
    }),
    prisma.tutorProfile.count(),
  ]);

  return {
    tutors,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateTutorVerification = async (id: string, isVerified: boolean) => {
  return prisma.tutorProfile.update({
    where: { id },
    data: { isVerified },
    include: {
      user: true,
      tutorCategories: {
        include: { category: true },
      },
    },
  });
};

const createStaffUser = async (data: CreateStaffInput) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
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
    emailVerified: true,
  });

  if (!createdUser) {
    throw new Error("Failed to create staff user");
  }

  await context.internalAdapter.linkAccount({
    userId: createdUser.id,
    providerId: "credential",
    accountId: createdUser.id,
    password: hashedPassword,
  });

  return { user: createdUser };
};

const getPlatformStats = async () => {
  const [
    totalUsers,
    totalTutors,
    totalStudents,
    totalBookings,
    activeCategories,
    pendingReports,
    openTickets,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "TUTOR" } }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.booking.count(),
    prisma.category.count({ where: { isActive: true } }),
    prisma.report.count({ where: { status: "PENDING" } }),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
  ]);

  return {
    totalUsers,
    totalTutors,
    totalStudents,
    totalBookings,
    activeCategories,
    pendingReports,
    openTickets,
  };
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllTutors,
  updateTutorVerification,
  createStaffUser,
  getPlatformStats,
};
