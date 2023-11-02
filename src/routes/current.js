const express = require("express");
const router = express.Router();

router.get("/current", (req, res) => {
  const user = req.session.user;
  if (!user) {
    return res.status(401).json({ message: "No has iniciado sesión." });
  }
  const userDTO = new UserDTO(user);
  res.json(userDTO);
});

module.exports = router;