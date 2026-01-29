import { prisma } from "../../lib/prisma";

interface TutorProfileInput {
  bio: string;
  hourlyRate: number;
  experience: number;
}

const createProfile = async (userId: string, data: TutorProfileInput) => {
  return await prisma.tutorProfile.create({
    data: {
      ...data,
      userId,
    },
  });
};

const getProfileByUserId = async (userId: string) => {
  return await prisma.tutorProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      tutorCategories: { include: { category: true } },
      availability: true,
      reviews: true,
    },
  });
};

const updateProfile = async (userId: string, data: TutorProfileInput) => {
  const existingProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (!existingProfile) return null;

  return await prisma.tutorProfile.update({
    where: { id: existingProfile.id },
    data: {
      bio: data.bio ?? existingProfile.bio,
      hourlyRate: data.hourlyRate ?? existingProfile.hourlyRate,
      experience: data.experience ?? existingProfile.experience,
      updatedAt: new Date(),
    },
  });
};

export const tutorService = {
  createProfile,
  getProfileByUserId,
  updateProfile,
};
