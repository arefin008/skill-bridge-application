import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { availabilityController } from "./availability.controller";

const router = Router();

router.post(
  "/",
  auth(UserRole.TUTOR),
  availabilityController.createAvailability,
);
router.get("/", auth(UserRole.TUTOR), availabilityController.getMyAvailability);
router.delete(
  "/:id",
  auth(UserRole.TUTOR),
  availabilityController.deleteAvailability,
);

export const availabilityRouter: Router = router;
