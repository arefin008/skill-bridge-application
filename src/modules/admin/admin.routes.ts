import express, { Router } from "express";
import { adminController } from "./admin.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.get("/users", auth(UserRole.ADMIN), adminController.getAllUsers);

router.patch(
  "/users/:id",
  auth(UserRole.ADMIN),
  adminController.updateUserStatus,
);

export const adminRouter: Router = router;
