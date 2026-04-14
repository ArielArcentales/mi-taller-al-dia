const globalExceptionHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (err.isOperational) {
    res.status(err.statusCode).json({
      estado: err.status,
      mensaje: err.message,
    });
  } else {
    console.error("ERROR NO CONTROLADO:", err);

    res.status(500).json({
      estado: "error",
      mensaje:
        "Ocurrió un problema interno en el servidor. Por favor, intente de nuevo más tarde.",
    });
  }
};

module.exports = globalExceptionHandler;
