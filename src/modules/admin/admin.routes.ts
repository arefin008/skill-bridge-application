import express, { Router } from "express";
import { adminController } from "./admin.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/stats", auth(UserRole.ADMIN), adminController.getPlatformStats);
router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);
router.get("/tutors", auth(UserRole.ADMIN), adminController.getAllTutors);
router.post("/staff", auth(UserRole.ADMIN), adminController.createStaffUser);
router.patch(
  "/tutors/:id/verify",
  auth(UserRole.ADMIN),
  adminController.updateTutorVerification,
);

router.patch(
  "/users/:id",
  auth(UserRole.ADMIN),
  adminController.updateUserStatus,
);

export const adminRouter: Router = router;
