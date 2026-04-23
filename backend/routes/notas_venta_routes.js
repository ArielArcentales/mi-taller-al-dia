const express = require("express");
const router = express.Router();
const notaVentaController = require("../controllers/nota_venta_controller");
const { protegerRuta } = require("../middlewares/auth_middleware");

router.use(protegerRuta);

router.post("/", notaVentaController.registrarNotaVenta);
router.get("/trabajo/:id_trabajo", notaVentaController.obtenerNotaVenta);

module.exports = router;
