const express = require("express");
const router = express.Router();
const UserDao = require("../dao/userDao");
const bcrypt = require("bcrypt");
const passport = require("passport");

router.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  }
  res.render("register");
});
router.post("/register", async (req, res) => {
  const { first_name, last_name, email, age, password } = req.body;
  try {
    const existingUser = await UserDao.getUserByEmail(email);
    if (existingUser) {
      return res.render("register", {
        error: "El correo electrónico ya está registrado",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
    };
    const createdUser = await UserDao.createUser(newUser);
    req.login(createdUser, (err) => {
      if (err) {
        console.error(err);
        return res
          .status(500)
          .json("error", { message: "Error interno del servidor" });
      }
      res.redirect("/profile");
    });
  } catch (error) {
    console.error(error);
    res.status(500).json("error", { message: "Error interno del servidor" });
  }
});
router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect("/profile");
  }
  res.render("login");
});
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  })
);
router.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }
  res.render("profile", { user: req.user });
});
router.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/login");
});
router.get(
  "/api/github",
  passport.authenticate("github", { scope: ["user:email"] })
);
router.get(
  "/api/github/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

module.exports = router;
