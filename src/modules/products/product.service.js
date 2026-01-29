const { validationResult } = require("express-validator");
const SubCategory = require("../../models/subCategory.model");
const Category = require("../../models/category.model");
const ApiError = require("../../utils/ApiError");
const { default: mongoose } = require("mongoose");
const Product = require("../../models/product.model");

async function getAllProducts() {
  const products = await Product.find()
    .populate({
      path: "subCategory",
      select: "title description",
      populate: {
        path: "category",
        select: "title description",
      },
    })
    .populate("createdBy", "username email")
    .sort({ createdAt: -1 });

  return products;
}

async function getProductById(id) {
  const product = await Product.findById(id)
    .populate({
      path: "subCategory",
      select: "title description",
      populate: {
        path: "category",
        select: "title description",
      },
    })
    .populate("createdBy", "username email");
  if (!product) throw new ApiError("SubCategory not found", 404);
  return product;
}

// async function createProduct({  title, description, subCategory, quantity, price,images, createdBy },files) {
//   // basic input validation (controller/validator should normally handle this)
//   if (!title || !description || !subCategory || !quantity || !price) {
//     throw new ApiError("Product, title, description, subCategory, quantity, price are required", 400);
//   }
//   const checkSubCategory = await SubCategory.findById(subCategory);
//   if (!checkSubCategory) {
//     throw new ApiError("SubCategory doest not exist", 400);
//   }
//   if (files && files.length > 0) {
//     images = files.map(file => file.path); // Cloudinary provides 'path' as the URL
//   }
// create new user
//   const product = await Product.create({ title, description, subCategory, quantity, price,images, createdBy })
//   await product.populate("createdBy", "username email");
//   await product.populate({
//       path: "subCategory",
//       select: "title description",
//       populate: {
//         path: "category",
//         select: "title description",
//       },
//     })
//   return {
//     product
//   };
// }

// async function updateProduct({ title, description, userId, catId, subCategoryId }) {
//   const subCategory = await SubCategory.findById(subCategoryId);
//   if (!subCategory) throw new ApiError("SubCategory not found", 404);

//   const catIdCheck = await Category.findById(catId);
//   if (!catIdCheck) {
//     throw new ApiError("Category doest not exist", 400);
//   }

//   if (subCategory.createdBy.toString() !== userId.toString()) {
//     throw new ApiError("Not authorized to update this Subcategory", 403);
//   }

//   subCategory.title = title || subCategory.title;
//   subCategory.description = description || subCategory.description;

//   const updatedSubCategory = await subCategory.save();
//   await updatedSubCategory.populate("createdBy", "username email");
//   await updatedSubCategory.populate("category", "title description");

//   return updatedSubCategory;
// }

async function createProduct(data, files, userId) {
  const { title, description, subCategory, quantity, price } = data;

  const checkSubCategory = await SubCategory.findById(subCategory);
  if (!checkSubCategory) throw new ApiError("SubCategory does not exist", 400);

  // Handle Cloudinary Multiple Images
  let imagePaths = [];
  if (files && files.length > 0) {
    imagePaths = files.map((file) => file.path);
  }

  const product = await Product.create({
    title,
    description,
    subCategory,
    quantity,
    price,
    images: imagePaths,
    createdBy: userId,
  });

  return await product.populate([
    { path: "createdBy", select: "username email" },
    {
      path: "subCategory",
      populate: { path: "category", select: "title" },
    },
  ]);
}

async function updateProduct(productId, data, files, userId) {
  const product = await Product.findById(productId);

  if (!product) throw new ApiError("Product not found", 404);

  // Authorization Check
  if (product.createdBy.toString() !== userId.toString()) {
    throw new ApiError("Not authorized to update this product", 403);
  }

  let updatedImages = [];

  if (data.existingImages) {
    updatedImages = Array.isArray(data.existingImages)
      ? data.existingImages
      : [data.existingImages];
  }

  if (files && files.length > 0) {
    const newFiles = files.map((file) => file.path);
    updatedImages = [...updatedImages, ...newFiles];
  }

  product.images = updatedImages;

  product.title = data.title || product.title;
  product.description = data.description || product.description;
  product.price = data.price || product.price;
  product.quantity = data.quantity || product.quantity;
  product.subCategory = data.subCategory || product.subCategory;

  await product.save();
  return await product.populate([
    { path: "createdBy", select: "username email" },
    { path: "subCategory", populate: { path: "category", select: "title" } },
  ]);
}

async function deleteProduct({ id, userId }) {
  const product = await Product.findById(id);
  if (!product) throw new ApiError("Product not found", 404);

  if (product.createdBy.toString() !== userId.toString()) {
    throw new ApiError("Not authorized to delete this product", 403);
  }

  await Product.findByIdAndDelete(id);
  return { _id: id };
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

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
