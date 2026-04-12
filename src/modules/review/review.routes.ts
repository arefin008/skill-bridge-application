import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { reviewController } from "./review.controller";

const router = express.Router();

router.post("/", auth(UserRole.STUDENT), reviewController.createReview);
router.get("/me", auth(UserRole.STUDENT), reviewController.getMyReviews);
router.get("/tutor/me", auth(UserRole.TUTOR), reviewController.getTutorReviews);

export const reviewRouter: Router = router;
