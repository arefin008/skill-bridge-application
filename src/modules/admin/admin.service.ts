import { prisma } from "../../lib/prisma";

const getAllUsers = async () => {
  return prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
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
