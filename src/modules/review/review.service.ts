import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

interface CreateReviewInput {
  bookingId: string;
  studentId: string;
  rating: number;
  comment: string;
}

const createReview = async (data: CreateReviewInput) => {
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { tutor: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.studentId !== data.studentId) {
    throw new Error("Unauthorized to review this booking");
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error("You can review only completed sessions");
  }

  const existingReview = await prisma.review.findUnique({
    where: { bookingId: data.bookingId },
  });

  if (existingReview) {
    throw new Error("Review already submitted for this booking");
  }

  const review = await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      studentId: data.studentId,
      tutorProfileId: booking.tutorProfileId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  const stats = await prisma.review.aggregate({
    where: { tutorProfileId: booking.tutorProfileId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.tutorProfile.update({
    where: { id: booking.tutorProfileId },
    data: {
      avgRating: stats._avg.rating ?? 0,
      totalReviews: stats._count.rating,
    },
  });

  return review;
};

const getMyReviews = async (studentId: string) => {
  return prisma.review.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
    include: {
      booking: true,
      tutor: {
        include: {
          user: true,
        },
      },
    },
  });
};

const getTutorReviews = async (userId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (!tutorProfile) {
    throw new Error("Tutor profile not found");
  }

  return prisma.review.findMany({
    where: { tutorProfileId: tutorProfile.id },
    orderBy: { createdAt: "desc" },
    include: {
      student: true,
      booking: true,
    },
  });
};

export const reviewService = {
  createReview,
  getMyReviews,
  getTutorReviews,
};
