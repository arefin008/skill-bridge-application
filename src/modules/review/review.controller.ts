import { Request, Response, NextFunction } from "express";
import { reviewService } from "./review.service";

const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const review = await reviewService.createReview({
      ...req.body,
      studentId: req.user!.id,
    });

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewController = {
  createReview,
};
