// this only handles http requests 
const categoryService = require("./category.service");

const getCategories = async (req, res) => {
  const result = await categoryService.getAllCategories();

  return res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    count: result.length,
    data: result,
  });
};

const getCategory = async (req, res) => {
  const result = await categoryService.getCategoryById(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Category fetched successfully",
    data: result,
  });
};


const createCategory = async (req, res) => {
  // const { title, description } = req.body;
  const result = await categoryService.createCategory(req.body, req.file, req.user._id);

  return res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: { category: result.category },
  });
};


const updateCategory = async (req, res) => {
  // const { title, description , catId } = req.body;
  const result = await categoryService.updateCategory(req.params.id, req.body, req.file, req.user._id);

  return res.status(200).json({
    success: true,
    message: "Category updated successfully",
    data: result,
  });
};


const deleteCategory = async (req, res) => {
  const result = await categoryService.deleteCategory({
    id: req.params.id,
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
};

const getCategoryTitles = async (req, res) => {
  const result = await categoryService.getCategoryTitles();

  return res.status(200).json({
    success: true,
    message: "Category titles fetched successfully",
    data: result,
  });
};




module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTitles,
};
