const Product = require("../models/product");

class ProductDao {
  async getProducts({ page, limit, sort, query }) {
    try {
      const options = {
        skip: (page - 1) * limit,
        limit,
        sort: { price: sort },
      };

      const products = await Product.find(
        { title: { $regex: query, $options: "i" } },
        null,
        options
      );
      return products;
    } catch (error) {
      throw new Error("Error al obtener productos");
    }
  }
  async createProduct(productData) {
    try {
      const newProduct = await Product.create(productData);
      return newProduct;
    } catch (error) {
      throw new Error("Error al crear el producto");
    }
  }
  async getProductById(productId) {
    try {
      const product = await Product.findById(productId);
      return product;
    } catch (error) {
      throw new Error("Error al obtener el producto");
    }
  }
  async updateProduct(productId, productData) {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        productData,
        { new: true }
      );
      return updatedProduct;
    } catch (error) {
      throw new Error("Error al actualizar el producto");
    }
  }
  async deleteProduct(productId) {
    try {
      const deletedProduct = await Product.findByIdAndDelete(productId);
      return deletedProduct;
    } catch (error) {
      throw new Error("Error al eliminar el producto");
    }
  }
}

module.exports = new ProductDao();