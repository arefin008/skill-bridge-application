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

const getMyReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reviews = await reviewService.getMyReviews(req.user!.id);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

const getTutorReviews = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reviews = await reviewService.getTutorReviews(req.user!.id);
    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

export const reviewController = {
  createReview,
  getMyReviews,
  getTutorReviews,
};
