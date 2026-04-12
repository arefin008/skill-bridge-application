import { NextFunction, Request, Response } from "express";
import { userService } from "./user.service";
import { sendSuccess } from "../../utils/apiResponse";

const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profile = await userService.getMyProfile(req.user!.id);

    if (!profile) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(sendSuccess(profile, "Profile fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const updatedUser = await userService.updateMyProfile(req.user!.id, req.body);
    return res
      .status(200)
      .json(sendSuccess(updatedUser, "Profile updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const userController = {
  getMyProfile,
  updateMyProfile,
};
