const express = require("express");
const router = express.Router();
const NotaVentaController = require("../controllers/nota_venta_controller");
const { protegerRuta, restringirA } = require("../middlewares/auth_middleware");

// Aquí llamamos exactamente a las funciones que me acabas de mostrar:
router.get(
  "/",
  protegerRuta,
  restringirA("admin", "superadmin"),
  NotaVentaController.obtenerHistorialNotas,
);
router.post(
  "/",
  protegerRuta,
  restringirA("admin", "superadmin"),
  NotaVentaController.registrarNotaVenta,
);

module.exports = router;
