const express = require("express");
const router = express.Router();
const ReporteController = require("../controllers/reporte_controller");
const { protegerRuta, restringirA } = require("../middlewares/auth_middleware");

// El ayudante (operativo) NO puede generar reportes
router.get(
  "/",
  protegerRuta,
  restringirA("admin", "superadmin"),
  ReporteController.obtenerReporte,
);

module.exports = router;
