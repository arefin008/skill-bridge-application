import { prisma } from "../../lib/prisma";

const getAllUsers = async (page: number = 1, limit: number = 10) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count(),
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

export const adminService = {
  getAllUsers,
  updateUserStatus,
};
