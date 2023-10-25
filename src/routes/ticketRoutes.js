const express = require("express");
const router = express.Router();
const Ticket = require("../models/ticketModel");

router.post("/crear_ticket", async (req, res) => {
  try {
    const { code, amount, purchaser } = req.body;

    if (!code || !amount || !purchaser) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }
    const nuevoTicket = new Ticket({
      code,
      amount,
      purchaser,
    });
    const ticketGuardado = await nuevoTicket.save();
    return res.status(201).json(ticketGuardado);
  } catch (error) {
    console.error("Error al crear el ticket:", error);
    return res.status(500).json({ error: "Error al crear el ticket" });
  }
});

module.exports = router;
