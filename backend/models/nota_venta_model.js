const db = require("../config/db");

const generarNumeroComprobante = async () => {
  const query =
    "SELECT numero_comprobante FROM notas_venta ORDER BY id_nota_venta DESC LIMIT 1";
  const result = await db.query(query);

  if (result.rows.length === 0) {
    return "NV-00001";
  }

  const ultimoNumero = result.rows[0].numero_comprobante;

  const numeroParte = parseInt(ultimoNumero.split("-")[1]);
  const nuevoNumero = numeroParte + 1;

  return `NV-${String(nuevoNumero).padStart(5, "0")}`;
};

const crearNotaVenta = async (
  id_trabajo,
  subtotal,
  iva,
  total,
  metodo_pago,
  detalles,
) => {
  const numero_comprobante = await generarNumeroComprobante();

  const query = `
    INSERT INTO notas_venta (id_trabajo, numero_comprobante, subtotal, iva, total, metodo_pago, detalles_adicionales)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const result = await db.query(query, [
    id_trabajo,
    numero_comprobante,
    subtotal,
    iva,
    total,
    metodo_pago,
    detalles,
  ]);
  return result.rows[0];
};

const obtenerNotaVentaPorTrabajo = async (id_trabajo) => {
  const query = `
    SELECT * FROM notas_venta WHERE id_trabajo = $1;
  `;
  const result = await db.query(query, [id_trabajo]);
  return result.rows[0];
};

module.exports = {
  crearNotaVenta,
  obtenerNotaVentaPorTrabajo,
};
