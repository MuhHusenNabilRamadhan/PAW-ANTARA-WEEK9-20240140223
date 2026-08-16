require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const { sequelize } = require("./models");

const authRoutes = require("./routes/auth.routes");
const todoRoutes = require("./routes/todo.routes");

const app = express();

// 1. Parsing Body (JSON & Form)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Setup EJS View Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// 3. Setup Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-default",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 hari
      httpOnly: true,
    },
  }),
);

// 4. Routes untuk Render Tampilan (UI)
app.get("/", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }

  // Mengirim data user ke views/index.ejs
  res.render("index", {
    user: {
      username: req.session.username || "User",
    },
  });
});

app.get("/login", (req, res) => {
  // Jika sudah login, langsung lempar ke dashboard
  if (req.session.userId) {
    return res.redirect("/");
  }
  res.render("login");
});

app.get("/register", (req, res) => {
  // Jika sudah login, langsung lempar ke dashboard
  if (req.session.userId) {
    return res.redirect("/");
  }
  res.render("register");
});

// 5. Routes API (Postman / Thunder Client / Fetch API)
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Koneksi database berhasil");

    await sequelize.sync();
    console.log("Sync model selesai");

    app.listen(PORT, () => {
      console.log(`Server jalan di http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Gagal konek ke database:", err.message);
  }
}

start();