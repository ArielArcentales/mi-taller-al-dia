const express = require("express");
const router = express.Router();
const usuarioController = require("../controllers/usuario_controller");

router.post("/registro", usuarioController.registrarUsuario);
router.post("/login", usuarioController.loginUsuario);

module.exports = router;
