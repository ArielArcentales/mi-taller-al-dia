const DashboardModel = require("../models/dashboard_model");

const obtenerDashboard = async (req, res, next) => {
  try {
    const [
      resumenTrabajos,
      ingresos,
      alertasEntregas,
      alertasInventario,
      trabajosAnulados,
    ] = await Promise.all([
      DashboardModel.obtenerResumenTrabajos(),
      DashboardModel.obtenerIngresos(),
      DashboardModel.obtenerAlertasEntregas(),
      DashboardModel.obtenerAlertasInventario(),
      DashboardModel.obtenerTrabajosAnulados(), // Llamamos a los anulados
    ]);

    res.status(200).json({
      resumen_trabajos: resumenTrabajos,
      finanzas: ingresos,
      alertas: {
        trabajos_atrasados: alertasEntregas,
        inventario_bajo: alertasInventario,
      },
      anulados: trabajosAnulados, // Lo enviamos en la respuesta
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerDashboard,
};
