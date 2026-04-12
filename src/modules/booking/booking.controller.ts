import { Request, Response, NextFunction } from "express";
import { bookingService } from "./booking.service";
import { sendSuccess } from "../../utils/apiResponse";

const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const booking = await bookingService.createBooking({
      ...req.body,
      studentId: req.user!.id,
    });

    res
      .status(201)
      .json(sendSuccess(booking, "Booking created successfully"));
  } catch (error) {
    next(error);
  }
};

const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.json(sendSuccess(bookings, "Bookings fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookings = await bookingService.getStudentBookings(req.user!.id);
    res.json(sendSuccess(bookings, "My bookings fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getTutorSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookings = await bookingService.getTutorBookings(req.user!.id);
    res.json(sendSuccess(bookings, "Tutor sessions fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const cancelMyBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await bookingService.cancelBooking(id, req.user!.id);

    res.json(sendSuccess(booking, "Booking cancelled successfully"));
  } catch (error) {
    next(error);
  }
};

const completeSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = req.params.id;
    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    const booking = await bookingService.completeBooking(id, req.user!.id);

    res.json(sendSuccess(booking, "Session marked as complete"));
  } catch (error) {
    next(error);
  }
};

export const bookingController = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getTutorSessions,
  cancelMyBooking,
  completeSession,
};
