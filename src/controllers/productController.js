const ProductService = require("../services/ProductService");
const { writeProductAuditLog } = require("../utils/productAuditLogger");

const handleError = (res, error) => {
  const status = error?.status || 500;
  const payload = {
    message: error?.message || "Unexpected server error.",
  };

  if (error?.details) {
    payload.details = error.details;
  }

  return res.status(status).json(payload);
};

const validateCreateFields = ({ shopId, name, price, stock }) => {
  const errors = [];

  if (!shopId) {
    errors.push("shopId is required.");
  }

  if (!name || name.trim().length < 2) {
    errors.push("Product name must be at least 2 characters long.");
  }

  if (price === undefined || price === null || Number.isNaN(Number(price))) {
    errors.push("price must be a valid number.");
  } else if (Number(price) < 0) {
    errors.push("price must be greater than or equal to 0.");
  }

  if (stock !== undefined && stock !== null && Number(stock) < 0) {
    errors.push("stock must be greater than or equal to 0.");
  }

  return errors;
};

// CREATE
const createProduct = async (req, res) => {
  try {
    const errors = validateCreateFields(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    const product = await ProductService.createProduct(req.body);

    const userEmail = req.user?.email || "unknown";

    writeProductAuditLog({
      userEmail,
      action: "CREATED",
      productName: product.name,
    });

    return res.status(201).json({
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


// READ ALL
const getAllProducts = async (_req, res) => {
  try {
    const products = await ProductService.getAllProducts();
    return res.status(200).json({ products });
  } catch (error) {
    return handleError(res, error);
  }
};

// READ BY ID
const getProductById = async (req, res) => {
  try {
    const product = await ProductService.getProductById(req.params.id);
    return res.status(200).json({ product });
  } catch (error) {
    return handleError(res, error);
  }
};

// UPDATE
const updateProduct = async (req, res) => {
  try {
    const product = await ProductService.updateProduct(
      req.params.id,
      req.body
    );

    const userEmail = req.user?.email || "unknown";

    writeProductAuditLog({
      userEmail,
      action: "UPDATED",
      productName: product.name,
      details: `(ID: ${product._id})`,
    });

    return res.status(200).json({
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


// DELETE
const deleteProduct = async (req, res) => {
  try {
    const product = await ProductService.deleteProduct(req.params.id);

    const userEmail = req.user?.email || "unknown";

    writeProductAuditLog({
      userEmail,
      action: "DELETED",
      productName: product.name,
    });

    return res.status(200).json({
      message: "Product deleted successfully.",
      product,
    });
  } catch (error) {
    return handleError(res, error);
  }
};


module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
