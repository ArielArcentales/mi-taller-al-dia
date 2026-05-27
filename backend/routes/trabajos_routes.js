const express = require("express");
const router = express.Router();
const trabajoController = require("../controllers/trabajo_controller");
const { protegerRuta } = require("../middlewares/auth_middleware");

router.use(protegerRuta);
router.post("/", trabajoController.registrarTrabajo);
router.get("/", trabajoController.obtenerTrabajos);
router.put("/:id/estado", trabajoController.actualizarEstadoTrabajo);
router.put("/:id", trabajoController.editarDetallesTrabajo);
router.delete("/:id", trabajoController.eliminarOrdenTrabajo);

module.exports = router;
