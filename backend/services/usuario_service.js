const UsuarioModel = require("../models/usuario_model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AppError = require("../exceptions/AppError");

const registrarUsuario = async (username, password, rol) => {
  const usuarioExistente = await UsuarioModel.buscarPorUsername(username);
  if (usuarioExistente) throw new AppError("El usuario ya existe", 400);

  const passwordHash = await bcrypt.hash(password, 10);
  const rolValido = ["superadmin", "admin", "operativo"].includes(rol)
    ? rol
    : "operativo";

  return await UsuarioModel.crearUsuario(username, passwordHash, rolValido);
};

const loginUsuario = async (username, password) => {
  const usuario = await UsuarioModel.buscarPorUsername(username);
  if (!usuario) throw new AppError("Credenciales incorrectas", 401);

  const passwordValida = await bcrypt.compare(password, usuario.password_hash);
  if (!passwordValida) throw new AppError("Credenciales incorrectas", 401);

  const payload = {
    id: usuario.id_usuario,
    username: usuario.username,
    rol: usuario.rol,
  };
  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET || "secreto_desarrollo",
    { expiresIn: "12h" },
  );

  return {
    usuario: {
      id: usuario.id_usuario,
      username: usuario.username,
      rol: usuario.rol,
    },
    token,
  };
};

const listarUsuarios = async () => await UsuarioModel.obtenerUsuarios();

const editarUsuario = async (id, username, rol) => {
  const rolValido = ["superadmin", "admin", "operativo"].includes(rol)
    ? rol
    : "operativo";
  return await UsuarioModel.actualizarUsuario(id, username, rolValido);
};

const borrarUsuario = async (id) => await UsuarioModel.eliminarUsuario(id);

module.exports = {
  registrarUsuario,
  loginUsuario,
  listarUsuarios,
  editarUsuario,
  borrarUsuario,
};
