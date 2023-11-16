require("dotenv").config();
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");
const hbs = require("express-handlebars");
const socketIo = require("socket.io");
const session = require("express-session");
const mongoConnect = require("./db/db");
const MongoStore = require("connect-mongo");
const URI = require("./db/db");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const UserDao = require("./dao/userDao");
const ProductDao = require("./dao/productDao");
const CartDao = require("./dao/cartDao");
const UserDTO = require("./DTO/userDTO");
const { checkRole } = require("./middleware/auth");
const SESSION_SECRET = require("./config/config");
const GITHUB_CLIENT_ID = require("./config/config");
const GITHUB_CLIENT_SECRET = require("./config/config");
const mockingModule = require("./mocking/mockingModule");
const errorHandler = require("./errors/errorHandler");
const chatController = require("./controllers/chatController");
const productController = require("./controllers/productController");
const logger = require('./modules/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require("./swagger/swagger")

const app = express();
const server = http.createServer(app);
const port = 8080;
const wss = new WebSocket.Server({ server });
const io = socketIo(server);

const mongoCon = () => {
  mongoConnect;
};

const sessionStore = MongoStore.create({
  mongoUrl: URI,
  collection: "sessions",
});

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.engine(
  "handlebars",
  hbs.engine({
    layoutsDir: path.join(__dirname, "views", "layouts"),
  })
);

app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const sessionsRoutes = require("./routes/sessionsRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const currentRoutes = require("./routes/current");

app.use("/api/sessions", sessionsRoutes);

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/api/sessions/githubcallback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await UserDao.findUserByGitHubId(profile.id);
        if (!user) {
          user = {
            githubId: profile.id,
            username: profile.username,
            age: 0,
            email: "",
            last_name: "",
            first_name: "",
          };
          await UserDao.createUser(user);
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new LocalStrategy(async (email, password, done) => {
    try {
      const user = await UserDao.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: "Usuario no encontrado" });
      }
      const passwordMatch = await UserDao.checkPassword(user, password);
      if (!passwordMatch) {
        return done(null, false, { message: "Contraseña incorrecta" });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((userDTO, done) => {
  done(null, userDTO.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await UserDao.getUserById(id);
    const userDTO = new UserDTO(user._id, user.username, user.email, user.role);
    done(null, userDTO);
  } catch (error) {
    done(error);
  }
});

app.use("/", (req, res, next) => {
  if (req.session.user) {
    return res.redirect("/productos");
  } else {
    return next();
  }
});

app.use(productRoutes);
app.use(cartRoutes);
app.use(currentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/current", currentRoutes);
app.post("/api/chat/send", checkRole("user"), chatController.sendMessage);
app.get("/api/chat/messages", checkRole("user"), chatController.getChatMessages);
app.post("/api/products", checkRole("admin"), productController.createProduct);
app.put("/api/products/:id", checkRole("admin"), productController.updateProduct);
app.delete("/api/products/:id", checkRole("admin"), productController.deleteProduct);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/api/sessions/profile");
  }
  res.render("login");
});

app.get("/mockingproducts", (req, res) => {
  const mockProducts = mockingModule.generateMockProducts();
  res.json(mockProducts);
});

app.get('/loggerTester', (req, res) => {
logger.debug('debug message');
logger.info('info message');
logger.warn('warning message');
logger.error('error message');
logger.fatal('fatal message');

res.send('Registro de prueba realizado.');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Ocurrió un error en el servidor" });
});

wss.on("connection", (ws) => {
  console.log("Nueva conexión");
  ws.on("close", () => {
    console.log("Conexión cerrada");
  });
});

io.on("connection", (socket) => {
  console.log("Cliente Socket.IO conectado");
  socket.on("new_product", async (productData) => {
    try {
      const newProduct = await ProductDao.createProduct(productData);
      io.emit("product_added", newProduct);
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  });
  socket.on("delete_product", async (productId) => {
    try {
      const deletedProduct = await ProductDao.deleteProduct(productId);
      io.emit("product_deleted", deletedProduct);
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  });
  socket.on("add_to_cart", async (cartId, productId, quantity) => {
    try {
      const updatedCart = await CartDao.addToCart(cartId, productId, quantity);
      io.emit("product_added_to_cart", updatedCart);
    } catch (error) {
      console.error("Error al agregar producto al carrito:", error);
    }
  });
  socket.on("disconnect", () => {
    console.log("Cliente Socket.IO desconectado");
  });
});

app.use(errorHandler);

server.listen(port, () => {
  console.log(`Servidor Express corriendo en http://localhost:${port}`);
});