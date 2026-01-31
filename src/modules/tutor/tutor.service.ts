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

export interface TutorFilter {
  subject?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
}

const getAllTutors = async (filters: TutorFilter) => {
  const { subject, minRating, minPrice, maxPrice } = filters;

  const where: any = {};

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.hourlyRate = {};
    if (minPrice !== undefined) where.hourlyRate.gte = Number(minPrice);
    if (maxPrice !== undefined) where.hourlyRate.lte = Number(maxPrice);
    if (Object.keys(where.hourlyRate).length === 0) delete where.hourlyRate;
  }

  if (minRating !== undefined) {
    where.avgRating = { gte: Number(minRating) };
  }

  if (subject) {
    where.tutorCategories = {
      some: {
        category: {
          name: {
            contains: subject,
            mode: "insensitive",
          },
        },
      },
    };
  }

  const tutors = await prisma.tutorProfile.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      tutorCategories: { include: { category: true } },
      availability: { where: { isBooked: false } },
      reviews: true,
    },
    orderBy: { avgRating: "desc" },
  });

  return tutors;
};

const getTutorById = async (id: string) => {
  return await prisma.tutorProfile.findUnique({
    where: { id },
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
  getAllTutors,
  getTutorById,
};
