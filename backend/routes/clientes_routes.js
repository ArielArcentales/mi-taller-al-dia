const express = require("express");
const router = express.Router();
const ClienteController = require("../controllers/cliente_controller");
const { protegerRuta } = require("../middlewares/auth_middleware");

// Todos los roles pueden gestionar clientes
router.get("/", protegerRuta, ClienteController.obtenerClientes);
router.post("/", protegerRuta, ClienteController.registrarCliente);
router.put("/:id", protegerRuta, ClienteController.actualizarCliente);
router.delete("/:id", protegerRuta, ClienteController.eliminarCliente);

module.exports = router;
