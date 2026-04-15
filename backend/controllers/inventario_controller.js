const InventarioModel = require("../models/inventario_model");
const AppError = require("../exceptions/AppError");

const registrarProducto = async (req, res, next) => {
  try {
    const { nombre, categoria, cantidad_actual, stock_minimo, precio_costo } =
      req.body;

    if (!nombre || cantidad_actual === undefined) {
      return next(
        new AppError("El nombre y la cantidad actual son obligatorios", 400),
      );
    }

    const nuevoProducto = await InventarioModel.agregarProducto(
      nombre,
      categoria,
      cantidad_actual,
      stock_minimo || 5,
      precio_costo || 0.0,
    );

    res
      .status(201)
      .json({
        mensaje: "Producto registrado en el inventario",
        producto: nuevoProducto,
      });
  } catch (error) {
    next(error);
  }
};

const obtenerInventario = async (req, res, next) => {
  try {
    const { q } = req.query;
    const inventario = await InventarioModel.obtenerInventario(q);
    res.status(200).json(inventario);
  } catch (error) {
    next(error);
  }
};

const actualizarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, categoria, cantidad_actual, stock_minimo, precio_costo } =
      req.body;

    const productoActualizado = await InventarioModel.actualizarProducto(
      id,
      nombre,
      categoria,
      cantidad_actual,
      stock_minimo,
      precio_costo,
    );

    if (!productoActualizado) {
      return next(
        new AppError("El producto no fue encontrado en el inventario", 404),
      );
    }

    res
      .status(200)
      .json({
        mensaje: "Inventario actualizado",
        producto: productoActualizado,
      });
  } catch (error) {
    next(error);
  }
};

const eliminarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productoEliminado = await InventarioModel.eliminarProducto(id);

    if (!productoEliminado) {
      return next(new AppError("El producto no existe", 404));
    }

    res.status(200).json({ mensaje: "Producto eliminado del sistema" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrarProducto,
  obtenerInventario,
  actualizarProducto,
  eliminarProducto,
};
