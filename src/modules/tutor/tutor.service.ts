import { prisma } from "../../lib/prisma";

interface TutorProfileInput {
  bio: string;
  hourlyRate: number;
  experience: number;
  teachingMethod?: string;
  headline?: string;
  categories?: string[];
}

const createProfile = async (userId: string, data: TutorProfileInput) => {
  return await prisma.tutorProfile.create({
    data: {
      userId,
      bio: data.bio,
      hourlyRate: data.hourlyRate,
      experience: data.experience,
      teachingMethod: data.teachingMethod,
      headline: data.headline,
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

const publicReviewInclude = {
  where: { isHidden: false },
  orderBy: { createdAt: "desc" as const },
  include: {
    student: {
      select: {
        id: true,
        name: true,
        image: true,
      },
    },
  },
};

const getProfileByUserId = async (userId: string) => {
  return await prisma.tutorProfile.findUnique({
    where: { userId },
    include: {
      user: true,
      tutorCategories: { include: { category: true } },
      availability: true,
      reviews: publicReviewInclude,
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
  page?: number;
  limit?: number;
  sortBy?: "avgRating" | "hourlyRate" | "experience" | "createdAt";
  sortOrder?: "asc" | "desc";
}

const getAllTutors = async (filters: TutorFilter) => {
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
    sortOrder = "desc",
  } = filters;

  const where: any = {};
  const skip = (page - 1) * limit;

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

  const [tutors, total] = await Promise.all([
    prisma.tutorProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
        tutorCategories: { include: { category: true } },
        availability: { where: { isBooked: false } },
        reviews: publicReviewInclude,
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    }),
    prisma.tutorProfile.count({ where }),
  ]);

  return {
    data: tutors,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      sortBy,
      sortOrder,
    },
  };
};

const getTutorById = async (id: string) => {
  return await prisma.tutorProfile.findUnique({
    where: { id },
    include: {
      user: true,
      tutorCategories: { include: { category: true } },
      availability: true,
      reviews: publicReviewInclude,
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
      teachingMethod:
        data.teachingMethod ?? existingProfile.teachingMethod,
      headline: data.headline ?? existingProfile.headline,
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
