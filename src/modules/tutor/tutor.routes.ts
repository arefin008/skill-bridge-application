import express, { Router } from "express";
import { tutorController } from "./tutor.controller";
import auth, { UserRole } from "../../middlewares/auth";
import { aiController } from "../ai/ai.controller";

const router = express.Router();

router.post("/", auth(UserRole.TUTOR), tutorController.createTutorProfile);

router.get("/", tutorController.getAllTutors);
router.get("/recommendations", aiController.getRecommendations);
router.get(
  "/my-profile",
  auth(UserRole.TUTOR),
  tutorController.getMyProfile,
);

router.put(
  "/profile",
  auth(UserRole.TUTOR),
  tutorController.updateTutorProfile,
);

router.get("/:id/review-insights", aiController.getReviewInsights);
router.get("/:id", tutorController.getTutorById);

export const tutorRouter: Router = router;
