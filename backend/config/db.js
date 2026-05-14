//Importar la clase 'Pool' de la librería 'pg' (node-postgres)//
const { Pool } = require("pg");
//Cargar las variables definidas en el archivo .env//
require("dotenv").config();

//Crear la instancia de conexiones (Pool)//
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

//Exportar este puente de conexión//
module.exports = pool;
