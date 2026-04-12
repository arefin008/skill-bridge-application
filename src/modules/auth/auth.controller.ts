import { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "../../utils/apiResponse";

const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await authService.getCurrentUser(userId);
    if (!result) return res.status(404).json({ message: "User not found" });

    return res.status(200).json(sendSuccess(result, "Current user fetched"));
  } catch (error) {
    next(error);
  }
};

export const authController = {
  getCurrentUser,
};
