import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { dashboardController } from "./dashboard.controller";

const router = Router();

router.get(
  "/student",
  auth(UserRole.STUDENT),
  dashboardController.getStudentDashboard,
);

router.get(
  "/tutor",
  auth(UserRole.TUTOR),
  dashboardController.getTutorDashboard,
);

router.get(
  "/moderator",
  auth(UserRole.MODERATOR),
  dashboardController.getModeratorDashboard,
);

router.get(
  "/support",
  auth(UserRole.SUPPORT_MANAGER),
  dashboardController.getSupportDashboard,
);

export const dashboardRouter = router;
