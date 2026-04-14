const db = require("../config/db");
//Crear un cliente//
const crearCliente = async (nombre_completo, telefono, notas) => {
  const query = `INSERT INTO clientes (nombre_completo, telefono, notas) VALUES ($1, $2, $3) RETURNING *;`;
  const result = await db.query(query, [nombre_completo, telefono, notas]);
  return result.rows[0];
};

//Buscar & Leer//
const obtenerClientes = async (busqueda) => {
  if (busqueda) {
    const query = `
      SELECT * FROM clientes 
      WHERE nombre_completo ILIKE $1 OR telefono ILIKE $1 
      ORDER BY id_cliente DESC;
    `;
    const result = await db.query(query, [`%${busqueda}%`]);
    return result.rows;
  } else {
    const query = `SELECT * FROM clientes ORDER BY id_cliente DESC LIMIT 50;`;
    const result = await db.query(query);
    return result.rows;
  }
};

//Actualizar cliente//
const actualizarCliente = async (id, nombre_completo, telefono, notas) => {
  const query = `
    UPDATE clientes 
    SET nombre_completo = $1, telefono = $2, notas = $3 
    WHERE id_cliente = $4 
    RETURNING *;
  `;
  const result = await db.query(query, [nombre_completo, telefono, notas, id]);
  return result.rows[0];
};

//Eliminar cliente//
const eliminarCliente = async (id) => {
  const query = `DELETE FROM clientes WHERE id_cliente = $1 RETURNING *;`;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  crearCliente,
  obtenerClientes,
  actualizarCliente,
  eliminarCliente,
};
