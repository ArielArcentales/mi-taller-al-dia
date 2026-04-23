const db = require("../config/db");

const obtenerResumenTrabajos = async () => {
  const query = `
    SELECT estado, COUNT(*) as total
    FROM trabajos
    GROUP BY estado;
  `;
  const result = await db.query(query);
  return result.rows;
};

const obtenerIngresos = async () => {
  const query = `
    SELECT COALESCE(SUM(abono), 0) as total_abonos, COALESCE(SUM(precio), 0) as total_esperado
    FROM trabajos;
  `;
  const result = await db.query(query);
  return result.rows[0];
};

const obtenerAlertasEntregas = async () => {
  const query = `
    SELECT t.id_trabajo, c.nombre_completo, t.descripcion_producto, t.fecha_entrega_prometida
    FROM trabajos t
    JOIN clientes c ON t.id_cliente = c.id_cliente
    WHERE t.estado IN ('Pendiente', 'En Proceso') 
    AND t.fecha_entrega_prometida < CURRENT_DATE;
  `;
  const result = await db.query(query);
  return result.rows;
};

const obtenerAlertasInventario = async () => {
  const query = `
    SELECT nombre, categoria, cantidad_actual, stock_minimo
    FROM inventario
    WHERE cantidad_actual <= stock_minimo;
  `;
  const result = await db.query(query);
  return result.rows;
};

module.exports = {
  obtenerResumenTrabajos,
  obtenerIngresos,
  obtenerAlertasEntregas,
  obtenerAlertasInventario,
};
