const mongoose = require("mongoose");
const URI =
  "mongodb+srv://matiaslagoscarro:lFyL3RLNo4tpDowe@cluster0.kglh74l.mongodb.net/PreEntrega2?retryWrites=true&w=majority";

const mongoConnect = mongoose.connect(URI)
.then(() => console.log("Conectado a la base de datos"))
.catch((error) => console.log("Error al conectarse a la base de datos"));

module.exports = URI;
module.exports = mongoConnect;
