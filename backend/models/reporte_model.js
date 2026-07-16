const db = require("../config/db");

const generarReporteSemanal = async (fechaInicio, fechaFin) => {
  // 1. Finanzas: Notas de venta en el rango
  const qNotas = `
    SELECT nv.numero_comprobante, nv.total, nv.metodo_pago, c.nombre_completo
    FROM notas_venta nv
    JOIN trabajos t ON nv.id_trabajo = t.id_trabajo
    JOIN clientes c ON t.id_cliente = c.id_cliente
    WHERE DATE(nv.fecha_emision) >= $1 AND DATE(nv.fecha_emision) <= $2
  `;

  // 2. Trabajos: Nuevas órdenes ingresadas
  const qTrabajos = `
    SELECT t.id_trabajo, t.descripcion_producto, t.precio, t.estado, c.nombre_completo
    FROM trabajos t
    JOIN clientes c ON t.id_cliente = c.id_cliente
    WHERE DATE(t.fecha_ingreso) >= $1 AND DATE(t.fecha_ingreso) <= $2
  `;

  // 3. Inventario Crítico Actual
  const qInventario = `
    SELECT nombre, cantidad_actual, stock_minimo 
    FROM inventario 
    WHERE cantidad_actual <= stock_minimo AND estado = 'Activo'
  `;

  // 4. Nuevos Clientes
  const qClientes = `
    SELECT nombre_completo, telefono 
    FROM clientes 
    WHERE DATE(fecha_registro) >= $1 AND DATE(fecha_registro) <= $2
  `;

  // 5. Inventario Usado (Crucial: usa tu tabla movimientos_inventario)
  // Nota: Filtramos por tipo_movimiento = 'Salida' para ver lo que se consumió
  const qUsado = `
    SELECT i.nombre, SUM(m.cantidad) as cantidad_usada
    FROM movimientos_inventario m
    JOIN inventario i ON m.id_producto = i.id_producto
    WHERE m.tipo_movimiento = 'Salida' 
    AND DATE(m.fecha_movimiento) >= $1 AND DATE(m.fecha_movimiento) <= $2
    GROUP BY i.nombre
  `;

  const [resNotas, resTrabajos, resInventario, resClientes, resUsado] =
    await Promise.all([
      db.query(qNotas, [fechaInicio, fechaFin]),
      db.query(qTrabajos, [fechaInicio, fechaFin]),
      db.query(qInventario),
      db.query(qClientes, [fechaInicio, fechaFin]),
      db.query(qUsado, [fechaInicio, fechaFin]),
    ]);

  return {
    finanzas: resNotas.rows,
    trabajos: resTrabajos.rows,
    inventario_critico: resInventario.rows,
    clientes_nuevos: resClientes.rows,
    inventario_usado: resUsado.rows,
  };
};

module.exports = { generarReporteSemanal };
