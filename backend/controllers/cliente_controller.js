const ClienteModel = require("../models/cliente.model");
const AppError = require("../exceptions/AppError"); // Importamos nuestra clase

const registrarCliente = async (req, res, next) => {
  try {
    const { nombre_completo, telefono, notas } = req.body;

    if (!nombre_completo || !telefono) {
      return next(
        new AppError("El nombre y el teléfono son obligatorios", 400),
      );
    }

    const nuevoCliente = await ClienteModel.crearCliente(
      nombre_completo,
      telefono,
      notas,
    );

    res.status(201).json({
      mensaje: "¡Cliente registrado con éxito!",
      cliente: nuevoCliente,
    });
  } catch (error) {
    if (error.code === "23505") {
      return next(
        new AppError("Este número de teléfono ya está registrado", 400),
      );
    }
    next(error);
  }
};

const obtenerClientes = async (req, res, next) => {
  try {
    const { q } = req.query;
    const clientes = await ClienteModel.obtenerClientes(q);
    res.status(200).json(clientes);
  } catch (error) {
    next(error);
  }
};

const actualizarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre_completo, telefono, notas } = req.body;

    const clienteActualizado = await ClienteModel.actualizarCliente(
      id,
      nombre_completo,
      telefono,
      notas,
    );

    if (!clienteActualizado) {
      return next(
        new AppError("El cliente no fue encontrado en el sistema", 404),
      );
    }

    res.status(200).json({
      mensaje: "Cliente actualizado con éxito",
      cliente: clienteActualizado,
    });
  } catch (error) {
    next(error);
  }
};

const eliminarCliente = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clienteEliminado = await ClienteModel.eliminarCliente(id);

    if (!clienteEliminado) {
      return next(
        new AppError("El cliente no fue encontrado en el sistema", 404),
      );
    }

    res.status(200).json({ mensaje: "Cliente eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrarCliente,
  obtenerClientes,
  actualizarCliente,
  eliminarCliente,
};
