import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { userController } from "./user.controller";

const router = Router();

router.get(
  "/me",
  auth(
    UserRole.STUDENT,
    UserRole.TUTOR,
    UserRole.ADMIN,
    UserRole.MODERATOR,
    UserRole.SUPPORT_MANAGER,
  ),
  userController.getMyProfile,
);

router.patch(
  "/me",
  auth(
    UserRole.STUDENT,
    UserRole.TUTOR,
    UserRole.ADMIN,
    UserRole.MODERATOR,
    UserRole.SUPPORT_MANAGER,
  ),
  userController.updateMyProfile,
);

export const userRouter = router;
