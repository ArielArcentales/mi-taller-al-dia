const db = require("../config/db");

const crearTrabajo = async (
  id_cliente,
  desc_prod,
  desc_rep,
  precio,
  abono,
  fecha_entrega,
) => {
  const query = `
    INSERT INTO trabajos (id_cliente, descripcion_producto, descripcion_reparacion, precio, abono, fecha_entrega_prometida)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const result = await db.query(query, [
    id_cliente,
    desc_prod,
    desc_rep,
    precio,
    abono,
    fecha_entrega,
  ]);
  return result.rows[0];
};

const obtenerTrabajos = async (estado = "") => {
  let query = `
    SELECT t.*, c.nombre_completo, c.telefono 
    FROM trabajos t
    JOIN clientes c ON t.id_cliente = c.id_cliente
  `;

  const params = [];
  if (estado) {
    query += ` WHERE t.estado = $1`;
    params.push(estado);
  }

  query += ` ORDER BY t.fecha_ingreso DESC`;

  const result = await db.query(query, params);
  return result.rows;
};

const actualizarEstado = async (id, nuevoEstado) => {
  const query = `
    UPDATE trabajos 
    SET estado = $1, ultima_actualizacion = CURRENT_TIMESTAMP
    WHERE id_trabajo = $2
    RETURNING *;
  `;
  const result = await db.query(query, [nuevoEstado, id]);
  return result.rows[0];
};

module.exports = {
  crearTrabajo,
  obtenerTrabajos,
  actualizarEstado,
};
