const express = require("express");
const router = express.Router();
const inventarioController = require("../controllers/inventario_controller");
const { protegerRuta } = require("../middlewares/auth_middleware");

router.use(protegerRuta);

router.post("/", inventarioController.registrarProducto);
router.get("/", inventarioController.obtenerInventario);
router.put("/:id", inventarioController.actualizarProducto);
router.delete("/:id", inventarioController.eliminarProducto);

module.exports = router;
