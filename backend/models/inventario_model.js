const db = require("../config/db");

const agregarProducto = async (
  nombre,
  categoria,
  cantidad_actual,
  stock_minimo,
  precio_costo,
) => {
  const query = `
    INSERT INTO inventario (nombre, categoria, cantidad_actual, stock_minimo, precio_costo)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const result = await db.query(query, [
    nombre,
    categoria,
    cantidad_actual,
    stock_minimo,
    precio_costo,
  ]);
  return result.rows[0];
};

const obtenerInventario = async (busqueda = "") => {
  const query = `
    SELECT * FROM inventario 
    WHERE nombre ILIKE $1 OR categoria ILIKE $1
    ORDER BY nombre ASC;
  `;
  const result = await db.query(query, [`%${busqueda}%`]);
  return result.rows;
};

const actualizarProducto = async (
  id,
  nombre,
  categoria,
  cantidad_actual,
  stock_minimo,
  precio_costo,
) => {
  const query = `
    UPDATE inventario 
    SET nombre = $1, categoria = $2, cantidad_actual = $3, stock_minimo = $4, precio_costo = $5, ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_producto = $6
    RETURNING *;
  `;
  const result = await db.query(query, [
    nombre,
    categoria,
    cantidad_actual,
    stock_minimo,
    precio_costo,
    id,
  ]);
  return result.rows[0];
};

const eliminarProducto = async (id) => {
  const query = `
    DELETE FROM inventario 
    WHERE id_producto = $1
    RETURNING *;
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  agregarProducto,
  obtenerInventario,
  actualizarProducto,
  eliminarProducto,
};
