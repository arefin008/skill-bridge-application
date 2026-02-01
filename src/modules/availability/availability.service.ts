import { prisma } from "../../lib/prisma";

interface CreateAvailabilityInput {
  tutorProfileId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const createAvailability = async (data: CreateAvailabilityInput) => {
  const conflict = await prisma.availability.findFirst({
    where: {
      tutorProfileId: data.tutorProfileId,
      dayOfWeek: data.dayOfWeek,
      startTime: { lt: data.endTime },
      endTime: { gt: data.startTime },
    },
  });

  if (conflict) {
    throw new Error("Availability slot overlaps with an existing one");
  }

  return prisma.availability.create({
    data,
  });
};

const getTutorAvailability = async (tutorProfileId: string) => {
  return prisma.availability.findMany({
    where: {
      tutorProfileId,
      isBooked: false,
    },
    orderBy: {
      startTime: "asc",
    },
  });
};

const deleteAvailability = async (id: string, tutorProfileId: string) => {
  const slot = await prisma.availability.findUnique({ where: { id } });

  if (!slot || slot.tutorProfileId !== tutorProfileId) {
    throw new Error("Availability not found or unauthorized");
  }

  if (slot.isBooked) {
    throw new Error("Cannot delete a booked slot");
  }

  return prisma.availability.delete({ where: { id } });
};

export const availabilityService = {
  createAvailability,
  getTutorAvailability,
  deleteAvailability,
};
