import express, { Router } from "express";
import { authController } from "./auth.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get(
  "/me",
  auth(UserRole.STUDENT, UserRole.TUTOR, UserRole.ADMIN),
  authController.getCurrentUser,
);
export const authRouter: Router = router;
