import { prisma } from "../../lib/prisma";

interface TutorProfileInput {
  bio: string;
  hourlyRate: number;
  experience: number;
  categories?: string[];
}

const createProfile = async (userId: string, data: TutorProfileInput) => {
  return await prisma.tutorProfile.create({
    data: {
      userId,
      bio: data.bio,
      hourlyRate: data.hourlyRate,
      experience: data.experience,
      ...(data.categories && {
        tutorCategories: {
          create: data.categories.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
      }),
    },
    include: {
      tutorCategories: { include: { category: true } },
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
  categoryId?: string;
  search?: string;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
}

const getAllTutors = async (filters: TutorFilter) => {
  const { subject, categoryId, search, minRating, minPrice, maxPrice } = filters;

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

  // Handle category filtering
  if (categoryId) {
    where.tutorCategories = {
      some: {
        categoryId,
      },
    };
  } else if (subject) {
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

  // Handle search by tutor name or category
  if (search) {
    where.OR = [
      {
        user: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        tutorCategories: {
          some: {
            category: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        },
      },
    ];
  }

  const tutors = await prisma.tutorProfile.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
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

const updateProfile = async (
  userId: string,
  data: Partial<TutorProfileInput> & { categories?: string[] },
) => {
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
      ...(data.categories && {
        tutorCategories: {
          deleteMany: {},
          create: data.categories.map((categoryId) => ({
            category: { connect: { id: categoryId } },
          })),
        },
      }),
    },
    include: {
      tutorCategories: { include: { category: true } },
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
