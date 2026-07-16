const db = require("../config/db");

const crearUsuario = async (username, passwordHash, rol = "operativo") => {
  const query = `
    INSERT INTO usuarios (username, password_hash, rol)
    VALUES ($1, $2, $3)
    RETURNING id_usuario, username, rol, fecha_creacion;
  `;
  const result = await db.query(query, [username, passwordHash, rol]);
  return result.rows[0];
};

const buscarPorUsername = async (username) => {
  const query = `SELECT * FROM usuarios WHERE username = $1;`;
  const result = await db.query(query, [username]);
  return result.rows[0];
};

const obtenerUsuarios = async () => {
  const query = `
    SELECT id_usuario, username, rol, fecha_creacion 
    FROM usuarios 
    ORDER BY rol ASC, username ASC;
  `;
  const result = await db.query(query);
  return result.rows;
};

const actualizarUsuario = async (id, username, rol) => {
  const query = `
    UPDATE usuarios 
    SET username = $1, rol = $2
    WHERE id_usuario = $3
    RETURNING id_usuario, username, rol;
  `;
  const result = await db.query(query, [username, rol, id]);
  return result.rows[0];
};

const eliminarUsuario = async (id) => {
  const query = `DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario;`;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  crearUsuario,
  buscarPorUsername,
  obtenerUsuarios,
  actualizarUsuario,
  eliminarUsuario,
};
