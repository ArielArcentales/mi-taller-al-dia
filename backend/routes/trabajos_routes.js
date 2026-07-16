const express = require("express");
const router = express.Router();
const TrabajoController = require("../controllers/trabajo_controller");
const { protegerRuta } = require("../middlewares/auth_middleware");

// Todos pueden gestionar las órdenes de trabajo
router.get("/", protegerRuta, TrabajoController.obtenerTrabajos);
router.post("/", protegerRuta, TrabajoController.registrarTrabajo);
router.put("/:id", protegerRuta, TrabajoController.editarDetallesTrabajo);
router.put(
  "/:id/estado",
  protegerRuta,
  TrabajoController.actualizarEstadoTrabajo,
);
router.delete("/:id", protegerRuta, TrabajoController.eliminarOrdenTrabajo);

module.exports = router;
