import { Request, Response, NextFunction } from "express";
import { categoryService } from "./category.service";

const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = await categoryService.createCategory(req.body.name);
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

const getCategories = async (_: Request, res: Response) => {
  const categories = await categoryService.getAllCategories();
  res.json(categories);
};

const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = await categoryService.updateCategoryStatus(
      req.params.id as string,
      req.body.isActive,
    );
    res.json(category);
  } catch (error) {
    next(error);
  }
};

export const categoryController = {
  createCategory,
  getCategories,
  updateCategory,
};
