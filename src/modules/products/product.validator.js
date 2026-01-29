const { body } = require("express-validator");
const addProductValidator = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 chars"),
  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 chars"),
  body("subCategory")
    .notEmpty()
    .withMessage("Category is required"),
  body("quantity")
    .notEmpty()
    .withMessage("Quantity is required"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
];

const updateProductValidator = [
  body("title")
    .optional()
    .isLength({ min: 3 }).withMessage("Title must be at least 3 chars"),
  body("description")
    .optional()
    .isLength({ min: 10 }).withMessage("Description must be at least 10 chars"),
  body("subCategory")
    .optional()
    .isMongoId().withMessage("Invalid SubCategory ID format"),
  body("quantity")
    .optional()
    .isNumeric().withMessage("Quantity must be a number"),
  body("price")
    .optional()
    .isNumeric().withMessage("Price must be a number")
];

module.exports = {
 addProductValidator,
 updateProductValidator
};
