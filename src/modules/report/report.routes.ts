import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { reportController } from "./report.controller";

const router = Router();

router.post(
  "/",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  reportController.createReport,
);
router.get(
  "/me",
  auth(UserRole.STUDENT, UserRole.TUTOR),
  reportController.getMyReports,
);
router.get(
  "/",
  auth(UserRole.ADMIN, UserRole.MODERATOR),
  reportController.getAllReports,
);
router.get(
  "/queue",
  auth(UserRole.ADMIN, UserRole.MODERATOR),
  reportController.getReportQueue,
);
router.get(
  "/activity-log",
  auth(UserRole.ADMIN, UserRole.MODERATOR),
  reportController.getModerationActivityLog,
);
router.patch(
  "/:id",
  auth(UserRole.MODERATOR, UserRole.ADMIN),
  reportController.moderateReport,
);

export const reportRouter = router;
