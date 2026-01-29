const { param } = require("../auth");
const productService = require("./product.service");


const getProducts = async (req, res) => {
  const result = await productService.getAllProducts();

  return res.status(200).json({
    success: true,
    message: "Categories fetched successfully",
    count: result.length,
    data: result,
  });
};

const getProduct = async (req, res) => {
  const result = await productService.getProductById(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Category fetched successfully",
    data: result,
  });
};

const createProduct = async (req, res) => {
  // Pass req.body AND req.files (from Multer)
  const result = await productService.createProduct(req.body, req.files, req.user._id);

  return res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: result,
  });
};

const updateProduct = async (req, res) => {
  const result = await productService.updateProduct(req.params.id, req.body, req.files, req.user._id);

  return res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: result,
  });
};

const deleteProduct = async (req, res) => {
  const result = await productService.deleteProduct({
    id: req.params.id,
    userId: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
    data: result,
  });
};


module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
