const ReporteModel = require("../models/reporte_model");
const AppError = require("../exceptions/AppError");

const obtenerReporte = async (req, res, next) => {
  try {
    const { inicio, fin } = req.query;

    if (!inicio || !fin) {
      return next(new AppError("Debe proporcionar fecha de inicio y fin", 400));
    }

    const datosReporte = await ReporteModel.generarReporteSemanal(inicio, fin);

    res.status(200).json(datosReporte);
  } catch (error) {
    next(error);
  }
};

module.exports = { obtenerReporte };
