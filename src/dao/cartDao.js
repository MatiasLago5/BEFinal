const Cart = require("../models/cart");

class CartDao {
  async getCartByUserId(userId) {
    try {
      const cart = await Cart.findOne({ user: userId }).populate(
        "products.product"
      );
      return cart;
    } catch (error) {
      throw new Error("Error al obtener el carrito de compras");
    }
  }
  async createCart(userId) {
    try {
      const cart = new Cart({ user: userId });
      await cart.save();
      return cart;
    } catch (error) {
      throw new Error("Error al crear el carrito de compras");
    }
  }
  async addToCart(userId, productId, quantity) {
    try {
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = await this.createCart(userId);
      }

      const productIndex = cart.products.findIndex(
        (item) => item.product == productId
      );

      if (productIndex !== -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      await cart.save();
      return cart;
    } catch (error) {
      throw new Error("Error al agregar productos al carrito");
    }
  }
  async removeFromCart(userId, productId) {
    try {
      const cart = await Cart.findOne({ user: userId });

      if (cart) {
        cart.products = cart.products.filter(
          (item) => item.product != productId
        );
        await cart.save();
      }

      return cart;
    } catch (error) {
      throw new Error("Error al eliminar productos del carrito");
    }
  }
  async clearCart(userId) {
    try {
      const cart = await Cart.findOne({ user: userId });

      if (cart) {
        cart.products = [];
        await cart.save();
      }

      return cart;
    } catch (error) {
      throw new Error("Error al vaciar el carrito");
    }
  }
}

module.exports = new CartDao();
