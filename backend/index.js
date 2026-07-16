// Importar los módulos principales
const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Importar la configuración y rutas modulares
const db = require("./config/db");
const clientesRoutes = require("./routes/clientes_routes");
const usuarioRoutes = require("./routes/usuario_routes");
const inventarioRoutes = require("./routes/inventario_routes");
const trabajosRoutes = require("./routes/trabajos_routes");
const dashboardRoutes = require("./routes/dashboard_routes");
const notasVentaRoutes = require("./routes/notas_venta_routes");
const reporteRoutes = require("./routes/reporte_routes");

// Importar el manejador de excepciones global
const globalExceptionHandler = require("./exceptions/handlers/globalExceptionHandler");

// Inicialización de la aplicación
const app = express();
const PORT = process.env.PORT || 3000; // Definir el puerto

app.use(cors());
app.use(express.json());

// Ruta de Comprobación
app.get("/", (req, res) => {
  res.send("El servidor está funcionando correctamente"); // Mensaje de confirmación
});

// Enrutadores (Endpoints de la API)
app.use("/api/clientes", clientesRoutes);
app.use("/api/usuarios", usuarioRoutes); // Endpoint de autenticación y gestión de usuarios
app.use("/api/inventario", inventarioRoutes);
app.use("/api/trabajos", trabajosRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notas-venta", notasVentaRoutes);
app.use("/api/reportes", reporteRoutes); // Nuevo módulo de reportes semanales

// Capturamos cualquier error arrojado por los controladores (Manejo de excepciones)
app.use(globalExceptionHandler);

// Arranque del servidor web
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Exportar la App
module.exports = app;
