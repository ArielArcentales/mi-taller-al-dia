// Importar la clase 'Pool' de la librería 'pg' (node-postgres)
const { Pool } = require("pg");
// Cargar las variables definidas en el archivo .env
require("dotenv").config();

// Crear la instancia de conexión (Pool) apuntando a la nube
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Obligatorio para conectarse a servicios en la nube como Supabase
  },
});

// Exportar este puente de conexión
module.exports = pool;
