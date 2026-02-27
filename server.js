const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Conexión a la base de datos usando variables de entorno (Railway)
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

db.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar a la base de datos:", err);
  } else {
    console.log("✅ Base de datos conectada correctamente");
  }
});

/* =========================
   OBTENER TODOS LOS PRODUCTOS
========================= */
app.get("/productos", (req, res) => {
  db.query("SELECT * FROM productos", (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al obtener productos");
    } else {
      res.json(results);
    }
  });
});

/* =========================
   COMPRAR PRODUCTO (RESTAR 1)
========================= */
app.post("/comprar/:id", (req, res) => {
  const id = req.params.id;

  db.query(
    "UPDATE productos SET cantidad = cantidad - 1 WHERE id = ? AND cantidad > 0",
    [id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al comprar");
      } else {
        if (result.affectedRows === 0) {
          res.json({ mensaje: "Producto agotado" });
        } else {
          res.json({ mensaje: "Compra realizada con éxito" });
        }
      }
    }
  );
});

/* =========================
   AGREGAR PRODUCTO
========================= */
app.post("/agregar", (req, res) => {
  const { nombre, tipo, cantidad, precio, imagen } = req.body;

  db.query(
    "INSERT INTO productos (nombre, tipo, cantidad, precio, imagen) VALUES (?, ?, ?, ?, ?)",
    [nombre, tipo, cantidad, precio, imagen],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al agregar producto");
      } else {
        res.json({ mensaje: "Producto agregado correctamente" });
      }
    }
  );
});

/* =========================
   EDITAR PRODUCTO
========================= */
app.put("/editar/:id", (req, res) => {
  const id = req.params.id;
  const { nombre, tipo, cantidad, precio } = req.body;

  db.query(
    "UPDATE productos SET nombre = ?, tipo = ?, cantidad = ?, precio = ? WHERE id = ?",
    [nombre, tipo, cantidad, precio, id],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error al editar producto");
      } else {
        res.json({ mensaje: "Producto actualizado correctamente" });
      }
    }
  );
});

/* =========================
   ELIMINAR PRODUCTO
========================= */
app.delete("/eliminar/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM productos WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al eliminar producto");
    } else {
      res.json({ mensaje: "Producto eliminado correctamente" });
    }
  });
});

/* =========================
   INICIAR SERVIDOR
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});