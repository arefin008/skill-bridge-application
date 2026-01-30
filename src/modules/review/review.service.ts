import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

interface CreateReviewInput {
  bookingId: string;
  studentId: string;
  rating: number;
  comment: string;
}

const createReview = async (data: CreateReviewInput) => {
  // Validate booking
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: { tutor: true },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  // Ownership check
  if (booking.studentId !== data.studentId) {
    throw new Error("Unauthorized to review this booking");
  }

  // Booking must be completed
  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error("You can review only completed sessions");
  }

  // Prevent duplicate review
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: data.bookingId },
  });

  if (existingReview) {
    throw new Error("Review already submitted for this booking");
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      studentId: data.studentId,
      tutorProfileId: booking.tutorProfileId,
      rating: data.rating,
      comment: data.comment,
    },
  });

  // Update tutor rating
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

export const reviewService = {
  createReview,
};
