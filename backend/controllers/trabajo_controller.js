const TrabajoModel = require("../models/trabajo_model");
const AppError = require("../exceptions/AppError");

const registrarTrabajo = async (req, res, next) => {
  try {
    const { id_cliente, articulos, abono, fecha_entrega_prometida } = req.body;

    if (
      !id_cliente ||
      !articulos ||
      !Array.isArray(articulos) ||
      articulos.length === 0
    ) {
      return next(
        new AppError("Faltan datos obligatorios o artículos a reparar", 400),
      );
    }

    // MAGIA: Calculamos el total y generamos un resumen de nombres
    let precioTotal = 0;
    const nombresProductos = [];

    articulos.forEach((art) => {
      precioTotal += parseFloat(art.precio || 0);
      nombresProductos.push(art.producto);
    });

    const descripcion_producto = nombresProductos.join(" y ");
    const descripcion_reparacion = JSON.stringify(articulos); // Guardamos todo el array como texto JSON

    if (parseFloat(abono || 0) > precioTotal) {
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
      precioTotal,
      parseFloat(abono || 0),
      fecha_entrega_prometida || null,
    );

    res
      .status(201)
      .json({
        mensaje: "Orden de trabajo creada con éxito",
        trabajo: nuevoTrabajo,
      });
  } catch (error) {
    if (error.code === "23503")
      return next(new AppError("El cliente no existe", 404));
    next(error);
  }
};

const obtenerTrabajos = async (req, res, next) => {
  try {
    const { estado } = req.query;
    const trabajos = await TrabajoModel.obtenerTrabajos(estado);

    // Transformamos el JSON guardado de vuelta a un arreglo para React
    const trabajosFormateados = trabajos.map((t) => {
      let listaArticulos = [];
      try {
        listaArticulos = JSON.parse(t.descripcion_reparacion);
        if (!Array.isArray(listaArticulos)) throw new Error();
      } catch (e) {
        // Si falla, es una orden antigua de 1 solo producto, la adaptamos al nuevo formato
        listaArticulos = [
          {
            id_temp: t.id_trabajo,
            producto: t.descripcion_producto,
            reparacion: t.descripcion_reparacion,
            precio: t.precio,
          },
        ];
      }
      return { ...t, articulos: listaArticulos };
    });

    res.status(200).json(trabajosFormateados);
  } catch (error) {
    next(error);
  }
};

const actualizarEstadoTrabajo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    const estadosValidos = [
      "Pendiente",
      "En Proceso",
      "Listo",
      "Entregado",
      "Anulado",
    ];

    if (!estadosValidos.includes(estado)) {
      return next(new AppError("Estado no válido.", 400));
    }

    const trabajoActualizado = await TrabajoModel.actualizarEstado(id, estado);
    if (!trabajoActualizado)
      return next(new AppError("El trabajo no fue encontrado", 404));

    res.status(200).json({ mensaje: `Marcado como: ${estado}` });
  } catch (error) {
    next(error);
  }
};

const editarDetallesTrabajo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { articulos, abono, fecha_entrega_prometida } = req.body;

    let precioTotal = 0;
    const nombresProductos = [];

    articulos.forEach((art) => {
      precioTotal += parseFloat(art.precio || 0);
      nombresProductos.push(art.producto);
    });

    const descripcion_producto = nombresProductos.join(" y ");
    const descripcion_reparacion = JSON.stringify(articulos);

    if (parseFloat(abono || 0) > precioTotal) {
      return next(
        new AppError("El abono no puede ser mayor al precio total", 400),
      );
    }

    const trabajoActualizado = await TrabajoModel.editarTrabajo(
      id,
      descripcion_producto,
      descripcion_reparacion,
      precioTotal,
      parseFloat(abono || 0),
      fecha_entrega_prometida || null,
    );

    if (!trabajoActualizado)
      return next(new AppError("Trabajo no encontrado", 404));

    res.status(200).json({ mensaje: "Detalles actualizados" });
  } catch (error) {
    next(error);
  }
};

const eliminarOrdenTrabajo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trabajoEliminado = await TrabajoModel.eliminarTrabajo(id);
    if (!trabajoEliminado)
      return next(new AppError("El trabajo no existe", 404));
    res.status(200).json({ mensaje: "Orden anulada" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registrarTrabajo,
  obtenerTrabajos,
  actualizarEstadoTrabajo,
  editarDetallesTrabajo,
  eliminarOrdenTrabajo,
};
