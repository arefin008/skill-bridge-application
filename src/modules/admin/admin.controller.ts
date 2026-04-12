import { Request, Response, NextFunction } from "express";
import { adminService } from "./admin.service";
import { UserRole } from "../../constants/roles";
import { sendSuccess } from "../../utils/apiResponse";

const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const role =
      typeof req.query.role === "string" ? (req.query.role as string) : undefined;
    
    const result = await adminService.getAllUsers(page, limit, role);
    return res.status(200).json(sendSuccess(result.users, "Users fetched successfully", result.meta));
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const updatedUser = await adminService.updateUserStatus(
      id as string,
      status,
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(sendSuccess(updatedUser, "User status updated successfully"));
  } catch (error) {
    next(error);
  }
};

const createStaffUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password, role, phone, image } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "name, email, password, and role are required",
      });
    }

    if (
      role !== UserRole.MODERATOR &&
      role !== UserRole.SUPPORT_MANAGER
    ) {
      return res.status(400).json({
        message: "Admin can only create MODERATOR or SUPPORT_MANAGER accounts",
      });
    }

    const result = await adminService.createStaffUser({
      name,
      email,
      password,
      role,
      phone,
      image,
    });

    return res
      .status(201)
      .json(sendSuccess(result.user, "Staff account created successfully"));
  } catch (error) {
    next(error);
  }
};

const getPlatformStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await adminService.getPlatformStats();
    return res.status(200).json(sendSuccess(stats, "Platform stats fetched successfully"));
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
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await adminService.getAllTutors(page, limit);
    return res.status(200).json(sendSuccess(result.tutors, "Tutors fetched successfully", result.meta));
  } catch (error) {
    next(error);
  }
};

const updateTutorVerification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { isVerified } = req.body;

    if (typeof isVerified !== "boolean") {
      return res.status(400).json({ message: "isVerified must be a boolean" });
    }

    const tutor = await adminService.updateTutorVerification(
      req.params.id as string,
      isVerified,
    );

    return res
      .status(200)
      .json(sendSuccess(tutor, "Tutor verification updated successfully"));
  } catch (error) {
    next(error);
  }
};

export const adminController = {
  getAllUsers,
  updateUserStatus,
  createStaffUser,
  getPlatformStats,
  getAllTutors,
  updateTutorVerification,
};
