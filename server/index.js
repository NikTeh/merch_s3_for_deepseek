require("dotenv").config();
const express = require("express");
const session = require("express-session");
const Tabulator = require("tabulator-tables");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./services/db"); // подключение к БД

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

// ===== Middleware =====
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // для http
  })
);

// ===== Авторизация =====
function authMiddleware(req, res, next) {
  if (req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: "Не авторизован" });
}

// ===== Статика =====
app.use(express.static(path.join(__dirname, "services", "public")));
app.use(
  "/tabulator-tables",
  express.static(path.join(__dirname, "../node_modules/tabulator-tables"))
);

app.use("/xlsx", express.static(path.join(__dirname, "../node_modules/xlsx")));

// ===== Маршруты =====

// Стартовая страница — форма логина
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "services", "public", "login.html"));
});

// Логин
app.post("/login", (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD || password === "1234") {
    req.session.authenticated = true;
    return res.json({ success: true });
  }
  res.status(401).json({ error: "Неверный пароль" });
});

// API — Отчёты

app.get("/api/reports", authMiddleware, async (req, res) => {
  try {
    const resultA = await db.query(
      "SELECT * FROM reports_a ORDER BY report_date DESC"
    );
    const resultB = await db.query(
      "SELECT * FROM reports_b ORDER BY report_date DESC"
    );

    const fixedReportsA = resultA.rows.map((r) => {
      if (r.photo_url && !r.photo_url.startsWith("http")) {
        r.photo_url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${r.photo_url}`;
      }
      return r;
    });
     const fixedReportsB = resultB.rows.map((r) => {
      if (r.photo_url && !r.photo_url.startsWith("http")) {
        r.photo_url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${r.photo_url}`;
      }
      return r;
    });

    res.json({ resultA: fixedReportsA, resultB: fixedReportsB, }); // отправляем только один раз
  } catch (err) {
    console.error("Ошибка загрузки отчётов:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Ошибка загрузки данных" });
    }
  }
});

// API - Фото

app.get("/api/photos", authMiddleware, async (req, res) => {
  try {
    const { table, merch_name } = req.query;

    // Проверка таблицы
    let tableName;
    if (table === "Магазины") {
      tableName = "reports_a";
    } else if (table === "Аптеки") {
      tableName = "reports_b";
    } else {
      return res.status(400).json({ error: "Неверный отдел" });
    }

    let query = `SELECT merch_name, photo_url, report_date 
                 FROM ${tableName}`;
    let params = [];

    // Фильтр по имени
    if (merch_name && merch_name.trim() !== "") {
      params.push(merch_name.trim());
      query += ` WHERE merch_name = $${params.length}`;
    }

    query += " ORDER BY report_date DESC";

    const result = await db.query(query, params);

    // Добавляем полный URL к фото
    const photos = result.rows.map((r) => {
      if (r.photo_url && !r.photo_url.startsWith("https")) {
        r.photo_url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${r.photo_url}`;
      }
      return r;
    });

    res.json({ photos });
  } catch (err) {
    console.error("Ошибка загрузки фото:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Ошибка загрузки данных" });
    }
  }
});



// ===== Запуск =====
app.listen(PORT, () => {
  console.log(`✅ Сервер запущен: http://localhost:${PORT}`);
});
