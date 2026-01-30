import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

interface CreateBookingInput {
  studentId: string;
  tutorProfileId: string;
  categoryId: string;
  availabilityId: string;
  sessionDate: Date;
  startTime: string;
  endTime: string;
}

const createBooking = async (data: CreateBookingInput) => {
  // Validate availability
  const availability = await prisma.availability.findUnique({
    where: { id: data.availabilityId },
  });

  if (!availability) {
    throw new Error("Availability slot not found");
  }

  if (availability.isBooked) {
    throw new Error("This availability slot is already booked");
  }

  // Create booking
  const booking = await prisma.booking.create({
    data,
    include: {
      tutor: { include: { user: true } },
      category: true,
    },
  });

  // Lock availability
  await prisma.availability.update({
    where: { id: data.availabilityId },
    data: { isBooked: true },
  });

  return booking;
};

const getStudentBookings = async (studentId: string) => {
  return prisma.booking.findMany({
    where: { studentId },
    orderBy: { sessionDate: "desc" },
    include: {
      tutor: { include: { user: true } },
      category: true,
      review: true,
    },
  });
};

const getTutorBookings = async (userId: string) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { userId },
  });

  if (!tutor) throw new Error("Tutor profile not found");

  return prisma.booking.findMany({
    where: { tutorProfileId: tutor.id },
    orderBy: { sessionDate: "desc" },
    include: {
      student: true,
      category: true,
      review: true,
    },
  });
};

const cancelBooking = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking not found");

  // Ownership check (student only)
  if (booking.studentId !== userId) {
    throw new Error("Unauthorized to cancel this booking");
  }

  if (booking.status !== BookingStatus.CONFIRMED) {
    throw new Error("Only confirmed bookings can be cancelled");
  }

  // Cancel booking
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
  });

  // Free availability slot
  if (booking.availabilityId) {
    await prisma.availability.update({
      where: { id: booking.availabilityId },
      data: { isBooked: false },
    });
  }

  return updatedBooking;
};

export const bookingService = {
  createBooking,
  getStudentBookings,
  getTutorBookings,
  cancelBooking,
};
