const db = require("../config/db");

//CREAR UN USUARIO//
const crearUsuario = async (username, passwordHash, rol = "operativo") => {
  const query = `
    INSERT INTO usuarios (username, password_hash, rol)
    VALUES ($1, $2, $3)
    RETURNING id_usuario, username, rol, fecha_creacion;
  `;

  const result = await db.query(query, [username, passwordHash, rol]);
  return result.rows[0];
};

//BUSCAR UN USUARIO//
const buscarPorUsername = async (username) => {
  const query = `
    SELECT * FROM usuarios 
    WHERE username = $1;
  `;

  const result = await db.query(query, [username]);

  return result.rows[0];
};

module.exports = {
  crearUsuario,
  buscarPorUsername,
};
