import { prisma } from "../../lib/prisma";

const createCategory = async (name: string) => {
  return prisma.category.create({ data: { name } });
};

const getAllCategories = async () => {
  return prisma.category.findMany({ where: { isActive: true } });
};

const updateCategoryStatus = async (id: string, isActive: boolean) => {
  return prisma.category.update({
    where: { id },
    data: { isActive },
  });
};

export const categoryService = {
  createCategory,
  getAllCategories,
  updateCategoryStatus,
};
