import { NextFunction, Request, Response } from "express";
import { TutorFilter, tutorService } from "./tutor.service";

const createTutorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    console.log(user);
    const { bio, hourlyRate, experience } = req.body;
    if (!user) {
      return res.status(400).json({
        error: "User information is missing (Unauthorized)",
      });
    }

    if (!bio || !hourlyRate || !experience) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }
    const existingProfile = await tutorService.getProfileByUserId(user.id);
    if (existingProfile) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const profile = await tutorService.createProfile(user.id, {
      bio,
      hourlyRate,
      experience,
    });

    return res.status(201).json({
      message: "Profile created Successufully",
      profile,
    });
  } catch (error) {
    next(error);
  }
};

const getAllTutors = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Build filters conditionally
    const filters: TutorFilter = {};

    if (req.query.subject) {
      filters.subject = req.query.subject as string;
    }
    if (req.query.minRating) {
      filters.minRating = Number(req.query.minRating);
    }
    if (req.query.minPrice) {
      filters.minPrice = Number(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      filters.maxPrice = Number(req.query.maxPrice);
    }

    const tutors = await tutorService.getAllTutors(filters);

    return res.status(200).json({
      success: true,
      data: tutors,
    });
  } catch (error) {
    next(error);
  }
};

const getTutorById = async (req: Request, res: Response) => {
  const id = req.params.id;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid tutor ID" });
  }

  const tutor = await tutorService.getTutorById(id);
  if (!tutor) return res.status(404).json({ message: "Tutor not found" });
  res.json(tutor);
};

// Update current tutor profile
const updateTutorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { bio, hourlyRate, experience } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!bio && !hourlyRate && !experience) {
      return res
        .status(400)
        .json({ message: "At least one field is required" });
    }

    const updatedProfile = await tutorService.updateProfile(userId, {
      bio,
      hourlyRate,
      experience,
    });
    if (!updatedProfile)
      return res.status(404).json({ message: "Profile not found" });

    return res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const tutorController = {
  createTutorProfile,
  updateTutorProfile,
  getAllTutors,
  getTutorById,
};
