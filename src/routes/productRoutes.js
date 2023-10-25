const express = require("express");
const router = express.Router();
const ProductDao = require("../dao/productDao");

router.get("/products", async (req, res) => {
  const responseFormat = req.accepts(["html", "json"]);

  try {
    const DEFAULT_LIMIT = 10;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const sort =
      req.query.sort === "asc" ? 1 : req.query.sort === "desc" ? -1 : null;
    const query = req.query.query || "";

    const products = await ProductDao.getProducts({
      page,
      limit,
      sort,
      query,
    });
    const totalCount = await ProductDao.countProducts();
    const totalPages = Math.ceil(totalCount / limit);
    const prevPage = page > 1 ? page - 1 : null;
    const nextPage = page < totalPages ? page + 1 : null;
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const baseUrl = "/api/products";
    const queryParameters = [];
    if (limit !== DEFAULT_LIMIT) {
      queryParameters.push(`limit=${limit}`);
    }
    if (sort) {
      queryParameters.push(`sort=${sort === 1 ? "asc" : "desc"}`);
    }
    if (query) {
      queryParameters.push(`query=${query}`);
    }
    const prevLink = prevPage
      ? `${baseUrl}?page=${prevPage}${
          queryParameters.length > 0 ? `&${queryParameters.join("&")}` : ""
        }`
      : null;
    const nextLink = nextPage
      ? `${baseUrl}?page=${nextPage}${
          queryParameters.length > 0 ? `&${queryParameters.join("&")}` : ""
        }`
      : null;
    if (responseFormat === "json") {
      res.status(200).json({
        status: "success",
        payload: products,
        totalPages,
        prevPage,
        nextPage,
        page,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink,
      });
    } else {
      res.render("products/productsList", { products, user });
    }
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error al cargar los productos" });
  }
});
router.post("/", async (req, res) => {
  try {
    const newProduct = await ProductDao.createProduct(req.body);
    res.status(200).json({ product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el producto" });
  }
});
router.get("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const product = await ProductDao.getProductById(id);
    if (product) {
      res.render("products/productDetail", product);
    } else {
      res.status(404).json({ message: "Producto no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al cargar el producto" });
  }
});
router.put("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const updatedProduct = await ProductDao.updateProduct(id, req.body);
    res.status(200).json({ product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el producto" });
  }
});
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const deletedProduct = await ProductDao.deleteProduct(id);
    res
      .status(200)
      .json({ message: "Producto eliminado", product: deletedProduct });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el producto" });
  }
});

module.exports = router;