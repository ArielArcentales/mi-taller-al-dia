const express = require("express");
const router = express.Router();
const UsuarioController = require("../controllers/usuario_controller");
const { protegerRuta, restringirA } = require("../middlewares/auth_middleware");

// Públicas
router.post("/login", UsuarioController.loginUsuario);
router.get("/mantenimiento", UsuarioController.verMantenimiento);

// Protegidas (Solo Superadmin)
router.get(
  "/",
  protegerRuta,
  restringirA("superadmin"),
  UsuarioController.listarUsuarios,
);
router.post(
  "/",
  protegerRuta,
  restringirA("superadmin"),
  UsuarioController.registrarUsuario,
);
router.put(
  "/:id",
  protegerRuta,
  restringirA("superadmin"),
  UsuarioController.editarUsuario,
);
router.delete(
  "/:id",
  protegerRuta,
  restringirA("superadmin"),
  UsuarioController.eliminarUsuario,
);
router.post(
  "/mantenimiento",
  protegerRuta,
  restringirA("superadmin"),
  UsuarioController.gestionarMantenimiento,
);

module.exports = router;
