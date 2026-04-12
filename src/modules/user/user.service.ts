import { prisma } from "../../lib/prisma";

interface UpdateProfileInput {
  name?: string;
  phone?: string;
  image?: string | null;
}

const getMyProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      tutorProfile: {
        include: {
          tutorCategories: { include: { category: true } },
        },
      },
    },
  });
};

const updateMyProfile = async (userId: string, data: UpdateProfileInput) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
      ...(data.image !== undefined ? { image: data.image } : {}),
    },
  });
};

export const userService = {
  getMyProfile,
  updateMyProfile,
};
