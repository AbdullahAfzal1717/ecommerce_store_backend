const { validationResult } = require("express-validator");
const SubCategory = require("../../models/subCategory.model");
const Category = require("../../models/category.model");
const ApiError = require("../../utils/ApiError");
const { default: mongoose } = require("mongoose");
const categoryModel = require("../../models/category.model");

async function getAllSubCategories() {
  const subCategories = await SubCategory.find()
    .populate("createdBy", "username email")
    .populate("category", "title description")
    .sort({ createdAt: -1 });
  return subCategories;
}


async function getSubCategoryById(id) {
  const subCategory = await SubCategory.findById(id)
    .populate("createdBy","username email")
    .populate("category", "title description");
  if (!subCategory) throw new ApiError("SubCategory not found", 404);
  return subCategory;
}


async function createSubCategory({ title, description, createdBy, catId,image }) {
  // basic input validation (controller/validator should normally handle this)
  if (!title || !description || !catId) {
    throw new ApiError("Category, subCategory title and description are required", 400);
  }
  const catIdCheck = await Category.findById(catId);
  if (!catIdCheck) {
    throw new ApiError("Category doest not exist", 400);
  }
  // check existing user (by email or username)
  const existing = await SubCategory.findOne({ title });
  if (existing) {
    throw new ApiError("SubCategory title already exists", 400);
  }
  // create new user
  const subCategory = await SubCategory.create({ title, description, createdBy, category: catId ,image: image || ""});
  await subCategory.populate("createdBy", "username email");
  await subCategory.populate("category", "title description");

  return {
    subCategory
  };
}


async function updateSubCategory(subCategoryId,{ title, description, userId, catId,image }) {
  const subCategory = await SubCategory.findById(subCategoryId);
  if (!subCategory) throw new ApiError("SubCategory not found", 404);

  const catIdCheck = await Category.findById(catId);
  if (!catIdCheck) {
    throw new ApiError("Category doest not exist", 400);
  }

  if (subCategory.createdBy.toString() !== userId.toString()) {
    throw new ApiError("Not authorized to update this Subcategory", 403);
  }

  subCategory.title = title || subCategory.title;
  subCategory.description = description || subCategory.description;

  if (image) {
    subCategory.image = image;
  }

  const updatedSubCategory = await subCategory.save();
  await updatedSubCategory.populate("createdBy", "username email");
  await updatedSubCategory.populate("category", "title description");


  return updatedSubCategory;
}


// async function deleteSubCategory({ id, userId }) {
//   const category = await Category.findById(id);
//   if (!category) throw new ApiError("Category not found", 404);

//   if (category.createdBy.toString() !== userId.toString()) {
//     throw new ApiError("Not authorized to delete this category", 403);
//   }

//   await category.deleteOne();
//   return true;
// }


async function deleteSubCategory({ id, userId }) {
  const subCategory = await SubCategory.findById(id);
  if (!subCategory) throw new ApiError("SubCategory not found", 404);

  if (subCategory.createdBy.toString() !== userId.toString()) {
    throw new ApiError("Not authorized to delete this SubCategory", 403);
  }

  await SubCategory.findByIdAndDelete(id);

  return { _id: id };
}

async function getSubCategoryTitles() {
 
  const subcategories = await SubCategory.find().select("title").sort({ title: 1 });
  return subcategories;
}

module.exports = {
  getAllSubCategories,
  getSubCategoryById,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoryTitles,
};
