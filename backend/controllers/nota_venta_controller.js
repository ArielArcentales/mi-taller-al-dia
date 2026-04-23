const NotaVentaModel = require("../models/nota_venta_model");
const TrabajoModel = require("../models/trabajo_model");
const AppError = require("../exceptions/AppError");

const registrarNotaVenta = async (req, res, next) => {
  try {
    const {
      id_trabajo,
      subtotal,
      iva,
      total,
      metodo_pago,
      detalles_adicionales,
    } = req.body;

    if (!id_trabajo || subtotal === undefined || total === undefined) {
      return next(
        new AppError("Faltan datos financieros para emitir el recibo", 400),
      );
    }

    const nuevaNota = await NotaVentaModel.crearNotaVenta(
      id_trabajo,
      subtotal,
      iva || 0.0,
      total,
      metodo_pago || "Efectivo",
      detalles_adicionales,
    );

    await TrabajoModel.actualizarEstado(id_trabajo, "Entregado");

    res.status(201).json({
      mensaje: "Recibo generado y trabajo marcado como Entregado",
      comprobante: nuevaNota,
    });
  } catch (error) {
    if (error.code === "23505") {
      return next(
        new AppError("Este trabajo ya tiene una nota de venta generada", 400),
      );
    }
    next(error);
  }
};

const obtenerNotaVenta = async (req, res, next) => {
  try {
    const { id_trabajo } = req.params;
    const nota = await NotaVentaModel.obtenerNotaVentaPorTrabajo(id_trabajo);

    if (!nota) {
      return next(new AppError("No hay recibos para este trabajo", 404));
    }

    res.status(200).json(nota);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrarNotaVenta,
  obtenerNotaVenta,
};
