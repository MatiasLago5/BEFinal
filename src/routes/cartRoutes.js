const express = require("express");
const router = express.Router();
const CartDao = require("../dao/cartDao");
const CartController = require("../controllers/cartController");

router.post("/", async (req, res) => {
  try {
    const newCart = await CartDao.createCart();
    res.status(201).json({ cart: newCart });
  } catch (error) {
    res.status(400).json({ message: "Error al crear el carrito" });
  }
});
router.get("/:cid", async (req, res) => {
  const cid = req.params.cid;

  try {
    const cart = await CartDao.getCartByCartId(cid);
    if (cart) {
      res.render("carts/cartDetail", { cartId: cid, products: cart.products });
    } else {
      res.status(404).json({ message: "Carrito no encontrado" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al cargar el carrito" });
  }
});
router.post("/:cid/product/:pid", async (req, res) => {
  const cid = req.params.cid;
  const pid = req.params.pid;
  const quantity = req.body.quantity || 1;
  try {
    const cart = await CartDao.getCartByCartId(cid);
    const product = await CartDao.getProductById(pid);
    if (!cart || !product) {
      return res
        .status(404)
        .json({ message: "Carrito o producto no encontrado" });
    }
    await CartDao.addToCart(cid, pid, quantity);
    res.status(201).json({ cart });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al agregar el producto al carrito" });
  }
});
router.delete("/:cid/products/:pid", async (req, res) => {
  const cid = req.params.cid;
  const pid = req.params.pid;
  try {
    await CartDao.removeFromCart(cid, pid);
    res.json({ message: "Producto eliminado del carrito correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar el producto del carrito" });
  }
});
router.put("/:cid", async (req, res) => {
  const cid = req.params.cid;
  const newProducts = req.body.products;
  try {
    await CartDao.updateCart(cid, newProducts);
    res.json({ message: "Carrito actualizado correctamente" });
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar el carrito" });
  }
});
router.delete("/:cid", async (req, res) => {
  const cid = req.params.cid;
  try {
    await CartDao.clearCart(cid);
    res.json({ message: "Productos eliminados del carrito correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al eliminar los productos del carrito" });
  }
});

router.post("/:cid/purchase", CartController.purchaseCart);

module.exports = router;
