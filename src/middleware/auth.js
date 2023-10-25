function checkRole(role) {
  return (req, res, next) => {
    const user = req.session.user;
    if (user && user.role === role) {
      return next();
    }
    res
      .status(403)
      .json({ message: "No tienes permiso para acceder a esta ruta." });
  };
}
module.exports = { checkRole };
