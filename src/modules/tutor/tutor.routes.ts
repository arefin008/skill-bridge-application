import express, { Router } from "express";
import { tutorController } from "./tutor.controller";
import auth, { UserRole } from "../../middlewares/auth";

const router = express.Router();

router.post("/", auth(UserRole.TUTOR), tutorController.createTutorProfile);
router.get("/me", auth(UserRole.TUTOR), tutorController.getMyTutorProfile);
router.put("/me", auth(UserRole.TUTOR), tutorController.updateTutorProfile);

router.get("/", tutorController.getAllTutors);
router.get("/:id", tutorController.getTutorById);

export const tutorRouter: Router = router;
