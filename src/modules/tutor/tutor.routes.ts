import express, { Router } from "express";
import { tutorController } from "./tutor.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.post("/", auth(UserRole.TUTOR), tutorController.createTutorProfile);

router.get("/", tutorController.getAllTutors);
router.get("/:id", tutorController.getTutorById);

router.put(
  "/profile",
  auth(UserRole.TUTOR),
  tutorController.updateTutorProfile,
);

export const tutorRouter: Router = router;
