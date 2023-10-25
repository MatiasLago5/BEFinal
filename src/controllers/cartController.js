const Cart = require("../models/cart");
const TicketService = require("../services/ticketService");

const CartController = {
  purchaseCart: async (req, res) => {
    const cartId = req.params.cid;
    try {
      const cart = await Cart.findById(cartId).populate("products.product");
      const productsNotPurchased = [];
      const purchasedProducts = [];
      for (const cartProduct of cart.products) {
        const product = cartProduct.product;
        const quantityToPurchase = cartProduct.quantity;
        if (product.stock >= quantityToPurchase) {
          product.stock -= quantityToPurchase;
          await product.save();
          purchasedProducts.push({
            product: product._id,
            quantity: quantityToPurchase,
          });
        } else {
          productsNotPurchased.push({
            product: product._id,
            quantity: quantityToPurchase,
          });
        }
      }
      const totalAmount = purchasedProducts.reduce((total, item) => {
        const product = cart.products.find((cp) =>
          cp.product._id.equals(item.product)
        );
        return total + product.product.price * item.quantity;
      }, 0);
      const newTicket = await TicketService.createTicket({
        code: code,
        amount: totalAmount,
        purchaser: req.user.email,
        products: purchasedProducts,
      });
      cart.products = cart.products.filter(
        (cp) => !purchasedProducts.find((pp) => pp.product.equals(cp.product))
      );
      await cart.save();
      res.json({ notPurchased: productsNotPurchased, ticket: newTicket });
    } catch (error) {
      console.error("Error al procesar la compra:", error);
      res.status(500).json({ error: "Error al procesar la compra" });
    }
  },
};

module.exports = CartController;
