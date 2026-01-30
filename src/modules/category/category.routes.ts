import { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { categoryController } from "./category.controller";

const router = Router();

router.get("/", categoryController.getCategories);
router.post("/", auth(UserRole.ADMIN), categoryController.createCategory);
router.patch("/:id", auth(UserRole.ADMIN), categoryController.updateCategory);

export const categoryRouter: Router = router;
