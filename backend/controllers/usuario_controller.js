const UsuarioService = require("../services/usuario_service");
const AppError = require("../exceptions/AppError");
const {
  toggleMantenimiento,
  getEstadoMantenimiento,
} = require("../middlewares/auth_middleware");

const registrarUsuario = async (req, res, next) => {
  try {
    const { username, password, rol } = req.body;
    if (!username || !password) return next(new AppError("Faltan datos", 400));
    const nuevo = await UsuarioService.registrarUsuario(
      username,
      password,
      rol,
    );
    res.status(201).json({ mensaje: "Usuario creado", usuario: nuevo });
  } catch (error) {
    next(error);
  }
};

const loginUsuario = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return next(new AppError("Faltan datos", 400));
    const datos = await UsuarioService.loginUsuario(username, password);
    res
      .status(200)
      .json({
        mensaje: "Login exitoso",
        usuario: datos.usuario,
        token: datos.token,
      });
  } catch (error) {
    next(error);
  }
};

const listarUsuarios = async (req, res, next) => {
  try {
    res.status(200).json(await UsuarioService.listarUsuarios());
  } catch (error) {
    next(error);
  }
};

const editarUsuario = async (req, res, next) => {
  try {
    const actualizado = await UsuarioService.editarUsuario(
      req.params.id,
      req.body.username,
      req.body.rol,
    );
    res.status(200).json({ mensaje: "Actualizado", usuario: actualizado });
  } catch (error) {
    next(error);
  }
};

const eliminarUsuario = async (req, res, next) => {
  try {
    await UsuarioService.borrarUsuario(req.params.id);
    res.status(200).json({ mensaje: "Eliminado" });
  } catch (error) {
    next(error);
  }
};

const gestionarMantenimiento = (req, res, next) => {
  try {
    const nuevoEstado = toggleMantenimiento(req.body.estado);
    res.status(200).json({ mensaje: `Mantenimiento: ${nuevoEstado}` });
  } catch (error) {
    next(error);
  }
};

const verMantenimiento = (req, res) =>
  res.status(200).json({ modo_mantenimiento: getEstadoMantenimiento() });

module.exports = {
  registrarUsuario,
  loginUsuario,
  listarUsuarios,
  editarUsuario,
  eliminarUsuario,
  gestionarMantenimiento,
  verMantenimiento,
};
