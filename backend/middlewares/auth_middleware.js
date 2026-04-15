const jwt = require("jsonwebtoken");
const AppError = require("../exceptions/AppError");

const protegerRuta = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError(
        "Acceso denegado: Por favor inicie sesión en el sistema.",
        401,
      ),
    );
  }

  try {
    const tokenDecodificado = jwt.verify(token, process.env.JWT_SECRET);

    req.usuario = tokenDecodificado;

    next();
  } catch (error) {
    return next(
      new AppError(
        "Sesión expirada o inválida. Inicie sesión nuevamente.",
        401,
      ),
    );
  }
};

module.exports = {
  protegerRuta,
};
