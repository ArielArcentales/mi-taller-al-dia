const db = require("../config/db");

const agregarProducto = async (
  nombre,
  categoria,
  cantidad_actual,
  stock_minimo,
  precio_costo,
) => {
  const queryProd = `
    INSERT INTO inventario (nombre, categoria, cantidad_actual, stock_minimo, precio_costo)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const result = await db.query(queryProd, [
    nombre,
    categoria,
    cantidad_actual,
    stock_minimo,
    precio_costo,
  ]);
  const nuevoProducto = result.rows[0];

  if (cantidad_actual > 0) {
    await db.query(
      `
      INSERT INTO movimientos_inventario (id_producto, tipo_movimiento, cantidad, motivo)
      VALUES ($1, 'Entrada', $2, 'Inventario inicial')
    `,
      [nuevoProducto.id_producto, cantidad_actual],
    );
  }

  return nuevoProducto;
};

const obtenerInventario = async (busqueda = "") => {
  const query = `
    SELECT * FROM inventario 
    WHERE (nombre ILIKE $1 OR categoria ILIKE $1)
    AND estado = 'Activo'
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
  const prodAnterior = await db.query(
    `SELECT cantidad_actual FROM inventario WHERE id_producto = $1`,
    [id],
  );

  if (prodAnterior.rows.length === 0) return null;
  const cantidadVieja = prodAnterior.rows[0].cantidad_actual;

  const queryUpdate = `
    UPDATE inventario 
    SET nombre = $1, categoria = $2, cantidad_actual = $3, stock_minimo = $4, precio_costo = $5, ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_producto = $6
    RETURNING *;
  `;
  const result = await db.query(queryUpdate, [
    nombre,
    categoria,
    cantidad_actual,
    stock_minimo,
    precio_costo,
    id,
  ]);
  const productoActualizado = result.rows[0];

  const diferencia = cantidad_actual - cantidadVieja;

  if (diferencia !== 0) {
    const tipo = diferencia > 0 ? "Entrada" : "Salida";
    const cantidadAbsoluta = Math.abs(diferencia);

    await db.query(
      `
      INSERT INTO movimientos_inventario (id_producto, tipo_movimiento, cantidad, motivo)
      VALUES ($1, $2, $3, 'Ajuste manual de stock')
    `,
      [id, tipo, cantidadAbsoluta],
    );
  }

  return productoActualizado;
};

const eliminarProducto = async (id) => {
  const query = `
    UPDATE inventario 
    SET estado = 'Inactivo', ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_producto = $1
    RETURNING *;
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const obtenerHistorialProducto = async (id) => {
  const query = `
    SELECT * FROM movimientos_inventario 
    WHERE id_producto = $1 
    ORDER BY fecha_movimiento DESC;
  `;
  const result = await db.query(query, [id]);
  return result.rows;
};

module.exports = {
  agregarProducto,
  obtenerInventario,
  actualizarProducto,
  eliminarProducto,
  obtenerHistorialProducto,
};
