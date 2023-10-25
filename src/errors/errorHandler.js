const errorDictionary = require("./errorDictionary");

function handleError(err, req, res, next) {
  if (err.message && errorDictionary[err.message]) {
    const statusCode = 400;
    res.status(statusCode).json({ error: errorDictionary[err.message] });
  } else {
    const statusCode = 500;
    res.status(statusCode).json({ error: "Error interno del servidor" });
  }
}
module.exports = handleError;
