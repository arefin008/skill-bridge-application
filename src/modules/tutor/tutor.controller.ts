import { NextFunction, Request, Response } from "express";
import { tutorService } from "./tutor.service";

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

// Get current tutor profile
// export const getMyTutorProfile = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const userId = req.user?.id;
//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     const profile = await tutorService.getProfileByUserId(userId);
//     if (!profile) return res.status(404).json({ message: "Profile not found" });

//     return res.status(200).json({ profile });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updateTutorProfile = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.user?.id;
//     const { bio, hourlyRate, experience } = req.body;

//     if (!bio && !hourlyRate && !experience) {
//       return res.status(400).json({ message: "At least one field is required" });
//     }

//     const updatedProfile = await tutorService.updateProfile(userId!, { bio, hourlyRate, experience });

//     if (!updatedProfile) {
//       return res.status(404).json({ message: "Profile not found" });
//     }

//     return res.status(200).json({
//       message: "Profile updated successfully",
//       profile: updatedProfile,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

const getMyTutorProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const profile = await tutorService.getProfileByUserId(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });

    return res.status(200).json({ profile });
  } catch (error) {
    next(error);
  }
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

    return res
      .status(200)
      .json({
        message: "Profile updated successfully",
        profile: updatedProfile,
      });
  } catch (error) {
    next(error);
  }
};

export const tutorController = {
  createTutorProfile,
  getMyTutorProfile,
  updateTutorProfile,
};
