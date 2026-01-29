// src/modules/auth/auth.validator.js
const { body } = require("express-validator");
const subCategoryValidator = [
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
  body("catId")
    .notEmpty()
    .withMessage("Category is required")

];

const updateSubCategoryValidator = [
  body("title").optional().isLength({ min: 3 }),
  body("description").optional().isLength({ min: 10 }),
  body("catId").optional().isMongoId().withMessage("Invalid Category ID"),
];

module.exports = {
  subCategoryValidator,
  updateSubCategoryValidator
};
