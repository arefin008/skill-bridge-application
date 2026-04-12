import { NextFunction, Request, Response } from "express";
import { dashboardService } from "./dashboard.service";
import { sendSuccess } from "../../utils/apiResponse";

const getStudentDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await dashboardService.getStudentDashboard(req.user!.id);
    return res.status(200).json(sendSuccess(data, "Student dashboard fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getTutorDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await dashboardService.getTutorDashboard(req.user!.id);
    return res.status(200).json(sendSuccess(data, "Tutor dashboard fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getModeratorDashboard = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await dashboardService.getModeratorDashboard();
    return res.status(200).json(sendSuccess(data, "Moderator dashboard fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getSupportDashboard = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await dashboardService.getSupportDashboard();
    return res.status(200).json(sendSuccess(data, "Support dashboard fetched successfully"));
  } catch (error) {
    next(error);
  }
};

export const dashboardController = {
  getStudentDashboard,
  getTutorDashboard,
  getModeratorDashboard,
  getSupportDashboard,
};
