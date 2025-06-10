const express = require("express")
const cors = require("cors")
const path = require("path")
const fs = require("fs")
require("dotenv").config()
const errorHandler = require("./middleware/errorHandler")

const app = express()
const PORT = process.env.PORT || 5000

// Crear carpeta de uploads si no existe
const uploadsDir = path.join(__dirname, "uploads")
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Middleware
app.use(cors())
app.use(express.json())

// Configurar correctamente la ruta de archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Middleware para depuración de rutas de archivos estáticos
app.use("/uploads", (req, res, next) => {
  console.log("Acceso a archivo estático:", req.url)
  console.log("Ruta completa:", path.join(uploadsDir, req.url))

  // Verificar si el archivo existe
  const filePath = path.join(uploadsDir, req.url)
  if (fs.existsSync(filePath)) {
    console.log("El archivo existe")
  } else {
    console.log("El archivo NO existe")
  }

  next()
})

// Rutas
app.use("/api/auth", require("./routes/auth"))
app.use("/api/users", require("./routes/users"))
app.use("/api/posts", require("./routes/posts"))
app.use("/api/search", require("./routes/search"))
app.use("/api/notifications", require("./routes/notifications"))
app.use("/api/admin", require("./routes/admin"))



// Ruta para verificar archivos
app.get("/check-file", (req, res) => {
  const { path: filePath } = req.query
  if (!filePath) {
    return res.status(400).json({ message: "Se requiere el parámetro 'path'" })
  }

  const fullPath = path.join(__dirname, filePath)
  const exists = fs.existsSync(fullPath)

  res.json({
    path: filePath,
    fullPath,
    exists,
    stats: exists ? fs.statSync(fullPath) : null,
  })
})

// Middleware para manejo de errores
app.use(errorHandler)

// Al principio, tras el require de dotenv:
const pool = require("./config/db");  // ajusta la ruta si tu db.js está en otro sitio

// Ruta base para comprobar que el servidor responde
app.get("/", (_req, res) => {
  res.redirect(301, "https://proyecto-save-your-soul-client.vercel.app");
});

// Ruta para probar conexión a la base de datos y CRUD mínimo
app.get("/test-db", async (req, res) => {
  try {
    // 1) Prueba de cálculo simple
    const [calc] = await pool.query("SELECT 1 + 1 AS result");

    // 2) Inserción de un usuario de prueba (opcional)
    const username = "testuser";
    const email    = "testuser@example.com";

    // Solo insertamos si no existe
    const [exists] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    let action;
    if (exists.length === 0) {
      const [inserted] = await pool.query(
        "INSERT INTO users (username, email) VALUES (?, ?)",
        [username, email]
      );
      action = `inserted id ${inserted.insertId}`;
    } else {
      action = "already existed";
    }

    // Devolver resultado
    res.json({
      server: "✅ OK",
      calc:    calc[0].result,
      userTest: action
    });
  } catch (err) {
    console.error("Error en test-db:", err);
    res.status(500).json({ error: err.message });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
  console.log(`Carpeta de uploads: ${uploadsDir}`)
})
