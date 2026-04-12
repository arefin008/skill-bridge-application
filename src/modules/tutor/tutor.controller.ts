import { NextFunction, Request, Response } from "express";
import { TutorFilter, tutorService } from "./tutor.service";
import { sendSuccess } from "../../utils/apiResponse";

const allowedTutorSortBy = new Set([
  "avgRating",
  "hourlyRate",
  "experience",
  "createdAt",
]);
const allowedTutorSortOrder = new Set(["asc", "desc"]);

const createTutorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.user;
    const { bio, hourlyRate, experience, teachingMethod, headline, categories } =
      req.body;
    if (!user) {
      return res.status(400).json({
        error: "User information is missing (Unauthorized)",
      });
    }

    if (
      bio === undefined ||
      hourlyRate === undefined ||
      experience === undefined
    ) {
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
      teachingMethod,
      headline,
      categories,
    });

    return res
      .status(201)
      .json(sendSuccess(profile, "Profile created successfully"));
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
    if (req.query.categoryId) {
      filters.categoryId = req.query.categoryId as string;
    }
    if (req.query.search) {
      filters.search = req.query.search as string;
    }
    if (req.query.page) {
      filters.page = Number(req.query.page);
    }
    if (req.query.limit) {
      filters.limit = Number(req.query.limit);
    }
    if (req.query.sortBy) {
      const sortBy = req.query.sortBy as string;
      if (!allowedTutorSortBy.has(sortBy)) {
        return res.status(400).json({ message: "Invalid sortBy value" });
      }
      filters.sortBy = sortBy as TutorFilter["sortBy"];
    }
    if (req.query.sortOrder) {
      const sortOrder = req.query.sortOrder as string;
      if (!allowedTutorSortOrder.has(sortOrder)) {
        return res.status(400).json({ message: "Invalid sortOrder value" });
      }
      filters.sortOrder = sortOrder as TutorFilter["sortOrder"];
    }

    const tutors = await tutorService.getAllTutors(filters);

    return res
      .status(200)
      .json(sendSuccess(tutors.data, "Tutors fetched successfully", tutors.meta));
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
  res.json(sendSuccess(tutor, "Tutor fetched successfully"));
};

const updateTutorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { bio, hourlyRate, experience, teachingMethod, headline, categories } =
      req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (
      bio === undefined &&
      hourlyRate === undefined &&
      experience === undefined &&
      teachingMethod === undefined &&
      headline === undefined &&
      categories === undefined
    ) {
      return res
        .status(400)
        .json({ message: "At least one field is required" });
    }

    const updatedProfile = await tutorService.updateProfile(userId, {
      bio,
      hourlyRate,
      experience,
      teachingMethod,
      headline,
      categories,
    });
    if (!updatedProfile)
      return res.status(404).json({ message: "Profile not found" });

    return res
      .status(200)
      .json(sendSuccess(updatedProfile, "Profile updated successfully"));
  } catch (error) {
    next(error);
  }
};

const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const profile = await tutorService.getProfileByUserId(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    res.json(sendSuccess(profile, "Tutor profile fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const tutorController = {
  createTutorProfile,
  updateTutorProfile,
  getAllTutors,
  getTutorById,
  getMyProfile,
};
