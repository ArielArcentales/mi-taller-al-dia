const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/cliente_controller");

router.post("/", clienteController.registrarCliente);
router.get("/", clienteController.obtenerClientes);
router.put("/:id", clienteController.actualizarCliente);
router.delete("/:id", clienteController.eliminarCliente);

module.exports = router;
