const jwt = require("jsonwebtoken");
const AppError = require("../exceptions/AppError");

let modoMantenimiento = false;

const protegerRuta = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("Acceso denegado: Por favor inicie sesión.", 401));
  }

  try {
    const tokenDecodificado = jwt.verify(
      token,
      process.env.JWT_SECRET || "secreto_desarrollo",
    );
    req.usuario = tokenDecodificado;

    // Bloqueo por mantenimiento (solo el superadmin pasa)
    if (modoMantenimiento && req.usuario.rol !== "superadmin") {
      return next(
        new AppError(
          "El sistema está en mantenimiento. Intente más tarde.",
          503,
        ),
      );
    }

    next();
  } catch (error) {
    return next(new AppError("Sesión expirada o inválida.", 401));
  }
};

const restringirA = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(new AppError("Acceso denegado. Rol insuficiente.", 403));
    }
    next();
  };
};

const toggleMantenimiento = (estado) => {
  modoMantenimiento = estado;
  return modoMantenimiento;
};

const getEstadoMantenimiento = () => modoMantenimiento;

module.exports = {
  protegerRuta,
  restringirA,
  toggleMantenimiento,
  getEstadoMantenimiento,
};
