const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UsuarioModel = require("../models/usuario_model");
const AppError = require("../exceptions/AppError");

const registrarUsuario = async (username, passwordPlano, rol) => {
  const usuarioExistente = await UsuarioModel.buscarPorUsername(username);
  if (usuarioExistente) {
    throw new AppError("El nombre de usuario ya está en uso", 400);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordPlano, salt);

  const nuevoUsuario = await UsuarioModel.crearUsuario(
    username,
    passwordHash,
    rol,
  );
  return nuevoUsuario;
};

const loginUsuario = async (username, passwordPlano) => {
  const usuario = await UsuarioModel.buscarPorUsername(username);
  if (!usuario) {
    throw new AppError("Usuario o contraseña incorrectos", 401);
  }

  const passwordValido = await bcrypt.compare(
    passwordPlano,
    usuario.password_hash,
  );
  if (!passwordValido) {
    throw new AppError("Usuario o contraseña incorrectos", 401);
  }

  const payload = {
    id: usuario.id_usuario,
    rol: usuario.rol,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "8h" });

  return {
    usuario: {
      id: usuario.id_usuario,
      username: usuario.username,
      rol: usuario.rol,
    },
    token,
  };
};

module.exports = {
  registrarUsuario,
  loginUsuario,
};
