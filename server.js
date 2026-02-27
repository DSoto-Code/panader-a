const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

/* =========================
   CONEXIÓN A BASE DE DATOS
========================= */

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

    // 🔥 Crear tabla si no existe
    const crearTabla = `
      CREATE TABLE IF NOT EXISTS productos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        cantidad INT NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        imagen VARCHAR(255) NOT NULL
      )
    `;

    db.query(crearTabla, (err) => {
      if (err) {
        console.error("❌ Error creando la tabla:", err);
      } else {
        console.log("✅ Tabla productos lista");

        // 🔥 Insertar productos si la tabla está vacía
        db.query("SELECT COUNT(*) AS total FROM productos", (err, results) => {
          if (!err && results[0].total === 0) {
            const insertarProductos = `
              INSERT INTO productos (nombre, tipo, cantidad, precio, imagen)
              VALUES
              ('Concha', 'Pan', 10, 12.00, 'https://via.placeholder.com/150'),
              ('Dona', 'Pan', 8, 15.00, 'https://via.placeholder.com/150'),
              ('Pastel Chocolate', 'Pastel', 5, 250.00, 'https://via.placeholder.com/150')
            `;
            db.query(insertarProductos);
            console.log("✅ Productos iniciales insertados");
          }
        });
      }
    });
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
   COMPRAR PRODUCTO
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
    (err) => {
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
    (err) => {
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

  db.query("DELETE FROM productos WHERE id = ?", [id], (err) => {
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