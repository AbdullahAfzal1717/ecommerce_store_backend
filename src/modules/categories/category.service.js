// This handle business logic/ core logic like database queries, calculations, validations beyond simple checks, etc.
const { validationResult } = require("express-validator");
const Category = require("../../models/category.model");
const ApiError = require("../../utils/ApiError");
const { default: mongoose } = require("mongoose");

async function getAllCategories() {
  const categories = await Category.find()
    .populate("createdBy", "username email")
    .sort({ createdAt: -1 });
  return categories;
}

async function getCategoryById(id) {
  const category = await Category.findById(id).populate(
    "createdBy",
    "username email"
  );
  if (!category) throw new ApiError("Category not found", 404);
  return category;
}

async function createCategory(data, file, userId) {
  const { title, description } = data;

  if (!title || !description ) {
        throw new ApiError("Category title and description are required", 400);
      }

  const existing = await Category.findOne({ title });
  if (existing) throw new ApiError("Category title already exists", 400);

  // Extract Cloudinary URL
  let imageUrl = "";
  if (file) imageUrl = file.path;

  const category = await Category.create({ 
    title, 
    description, 
    image: imageUrl, 
    createdBy: userId 
  });
  
  return category;
}


// async function createCategory({ title, description, createdBy }) {
//   // basic input validation (controller/validator should normally handle this)
//   if (!title || !description || !createdBy) {
//     throw new ApiError("Category title and description are required", 400);
//   }
//   // check existing user (by email or username)
//   const existing = await Category.findOne({ title });
//   if (existing) {
//     throw new ApiError("Category title already exists", 400);
//   }
//   // create new user
//   const category = await Category.create({ title, description, createdBy });
//   return {
//     category
//   };
// }



async function updateCategory(catId, data, file, userId) {
  const category = await Category.findById(catId);
  if (!category) throw new ApiError("Category not found", 404);

  // Security Check
  if (category.createdBy.toString() !== userId.toString()) {
    throw new ApiError("Not authorized to update this category", 403);
  }

  // Update fields
  category.title = data.title || category.title;
  category.description = data.description || category.description;
  
  // Update image if new one is uploaded
  if (file) category.image = file.path;

  await category.save();
  return await category.populate("createdBy", "username email");
}


// async function updateCategory({ title, description, userId, catId }) {
// const category = await Category.findById(catId);
//   if (!category) throw new ApiError("Category not found", 404);

//   if (category.createdBy.toString() !== userId.toString()) {
//     throw new ApiError("Not authorized to update this category", 403);
//   }

//   category.title = title || category.title;
//   category.description = description || category.description;

//   const updatedCategory = await category.save();
//   await updatedCategory.populate("createdBy", "username email");

//   return updatedCategory;
// }


// async function deleteCategory({ id, userId }) {
//   const category = await Category.findById(id);
//   if (!category) throw new ApiError("Category not found", 404);

//   if (category.createdBy.toString() !== userId.toString()) {
//     throw new ApiError("Not authorized to delete this category", 403);
//   }

//   await category.deleteOne();
//   return true;
// }


async function deleteCategory({ id, userId }) {
  const category = await Category.findById(id);
  if (!category) throw new ApiError("Category not found", 404);

  if (category.createdBy.toString() !== userId.toString()) {
    throw new ApiError("Not authorized to delete this category", 403);
  }

  await Category.findByIdAndDelete(id);

  return { _id: id };
}

async function getCategoryTitles() {
 
  const categories = await Category.find().select("title").sort({ title: 1 });
  return categories;
}



module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTitles,
};

