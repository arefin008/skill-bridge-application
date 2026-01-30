import { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma";
import { availabilityService } from "./availability.service";

const createAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!tutor) throw new Error("Tutor profile not found");

    const slot = await availabilityService.createAvailability({
      tutorProfileId: tutor.id,
      ...req.body,
    });

    res.status(201).json(slot);
  } catch (error) {
    next(error);
  }
};

const getMyAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!tutor) throw new Error("Tutor profile not found");

    const slots = await availabilityService.getTutorAvailability(tutor.id);
    res.json(slots);
  } catch (error) {
    next(error);
  }
};

const deleteAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const tutor = await prisma.tutorProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!tutor) throw new Error("Tutor profile not found");

    const slot = await availabilityService.deleteAvailability(
      req.params.id as string,
      tutor.id,
    );
    res.json({ message: "Availability removed", slot });
  } catch (error) {
    next(error);
  }
};

export const availabilityController = {
  createAvailability,
  getMyAvailability,
  deleteAvailability,
};
