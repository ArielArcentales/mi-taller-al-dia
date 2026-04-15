const UsuarioService = require("../services/usuario_service");
const AppError = require("../exceptions/AppError");

const registrarUsuario = async (req, res, next) => {
  try {
    const { username, password, rol } = req.body;

    if (!username || !password) {
      return next(
        new AppError(
          "El nombre de usuario y la contraseña son obligatorios",
          400,
        ),
      );
    }

    const nuevoUsuario = await UsuarioService.registrarUsuario(
      username,
      password,
      rol,
    );

    res.status(201).json({
      mensaje: "Usuario creado con éxito",
      usuario: nuevoUsuario,
    });
  } catch (error) {
    next(error);
  }
};

const loginUsuario = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(
        new AppError("Por favor ingrese su usuario y contraseña", 400),
      );
    }

    const datosLogin = await UsuarioService.loginUsuario(username, password);

    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      usuario: datosLogin.usuario,
      token: datosLogin.token,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
};
