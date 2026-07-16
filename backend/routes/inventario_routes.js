const express = require("express");
const router = express.Router();
const InventarioController = require("../controllers/inventario_controller");
const { protegerRuta } = require("../middlewares/auth_middleware");

// Todos pueden gestionar el inventario
router.get("/", protegerRuta, InventarioController.obtenerInventario);
router.post("/", protegerRuta, InventarioController.registrarProducto);
router.put("/:id", protegerRuta, InventarioController.actualizarProducto);
router.delete("/:id", protegerRuta, InventarioController.eliminarProducto);
router.get(
  "/:id/historial",
  protegerRuta,
  InventarioController.obtenerHistorial,
);

module.exports = router;
