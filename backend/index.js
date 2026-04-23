const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");
const clientesRoutes = require("./routes/clientes_routes");
const usuarioRoutes = require("./routes/usuario_routes");
const inventarioRoutes = require("./routes/inventario_routes");
const trabajosRoutes = require("./routes/trabajos_routes");
const dashboardRoutes = require("./routes/dashboard_routes");
const globalExceptionHandler = require("./exceptions/handlers/globalExceptionHandler");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("El servidor está funcionando");
});

app.use("/api/clientes", clientesRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/inventario", inventarioRoutes);
app.use("/api/trabajos", trabajosRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use(globalExceptionHandler);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
