const { param } = require("../auth");
const subcategoryService = require("./subcategory.service");


const getSubCategories = async (req, res) => {
  const result = await subcategoryService.getAllSubCategories();

  return res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    count: result.length,
    data: result,
  });
};


const getSubCategory = async (req, res) => {
  const result = await subcategoryService.getSubCategoryById(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Category fetched successfully",
    data: result,
  });
};


const createSubCategory = async (req, res) => {
  const result = await subcategoryService.createSubCategory({ 
    ...req.body, 
    createdBy: req.user._id,
    image: req.file ? req.file.path : "" // Pass the Cloudinary URL from multer
  });

  return res.status(201).json({
    success: true,
    message: "Subcategory created successfully",
    data: result, // Result now contains the populated object
  });
};

const updateSubCategory = async (req, res) => {
  // We take the subCategoryId from params now
  const result = await subcategoryService.updateSubCategory(req.params.id, {
    ...req.body,
    userId: req.user._id,
    image: req.file ? req.file.path : undefined 
  });

  return res.status(200).json({
    success: true,
    message: "Subcategory updated successfully",
    data: result,
  });
};



const deleteSubCategory = async (req, res) => {
  const result = await subcategoryService.deleteSubCategory({
    id: req.params.id,
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: "SubCategory deleted successfully",
    data: result,
  });
};

const getSubCategoryTitles = async (req, res) => {
  const result = await subcategoryService.getSubCategoryTitles();

  return res.status(200).json({
    success: true,
    message: "SubCategory titles fetched successfully",
    data: result,
  });
};

module.exports = {
  getSubCategories,
  getSubCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoryTitles,
};
