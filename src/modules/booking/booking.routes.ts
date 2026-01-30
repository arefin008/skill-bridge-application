import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { bookingController } from "./booking.controller";

const router = express.Router();

// Student
router.post("/", auth(UserRole.STUDENT), bookingController.createBooking);
router.get("/me", auth(UserRole.STUDENT), bookingController.getMyBookings);
router.patch(
  "/:id/cancel",
  auth(UserRole.STUDENT),
  bookingController.cancelMyBooking,
);

// Tutor
router.get(
  "/tutor/me",
  auth(UserRole.TUTOR),
  bookingController.getTutorSessions,
);

export const bookingRouter: Router = router;
