const TrabajoModel = require("../models/trabajo_model");
const AppError = require("../exceptions/AppError");

const registrarTrabajo = async (req, res, next) => {
  try {
    const {
      id_cliente,
      descripcion_producto,
      descripcion_reparacion,
      precio,
      abono,
      fecha_entrega_prometida,
    } = req.body;

    if (
      !id_cliente ||
      !descripcion_producto ||
      !descripcion_reparacion ||
      precio === undefined
    ) {
      return next(
        new AppError(
          "Faltan datos obligatorios: cliente, producto, reparación o precio",
          400,
        ),
      );
    }

    if (abono > precio) {
      return next(
        new AppError(
          "El abono no puede ser mayor al precio total del trabajo",
          400,
        ),
      );
    }

    const nuevoTrabajo = await TrabajoModel.crearTrabajo(
      id_cliente,
      descripcion_producto,
      descripcion_reparacion,
      precio,
      abono || 0.0,
      fecha_entrega_prometida || null,
    );

    res.status(201).json({
      mensaje: "Orden de trabajo creada con éxito",
      trabajo: nuevoTrabajo,
    });
  } catch (error) {
    if (error.code === "23503") {
      return next(
        new AppError("El cliente seleccionado no existe en el sistema", 404),
      );
    }
    next(error);
  }
};

const obtenerTrabajos = async (req, res, next) => {
  try {
    const { estado } = req.query;
    const trabajos = await TrabajoModel.obtenerTrabajos(estado);
    res.status(200).json(trabajos);
  } catch (error) {
    next(error);
  }
};

const actualizarEstadoTrabajo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ["Pendiente", "En Proceso", "Listo", "Entregado"];
    if (!estadosValidos.includes(estado)) {
      return next(
        new AppError(
          "Estado no válido. Use: Pendiente, En Proceso, Listo o Entregado",
          400,
        ),
      );
    }

    const trabajoActualizado = await TrabajoModel.actualizarEstado(id, estado);

    if (!trabajoActualizado) {
      return next(new AppError("El trabajo no fue encontrado", 404));
    }

    res.status(200).json({
      mensaje: `El trabajo ahora está marcado como: ${estado}`,
      trabajo: trabajoActualizado,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrarTrabajo,
  obtenerTrabajos,
  actualizarEstadoTrabajo,
};
