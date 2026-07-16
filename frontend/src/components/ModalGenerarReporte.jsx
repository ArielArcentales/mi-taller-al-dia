import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { X, FileText, Calendar, Loader2, Download } from "lucide-react";

const ModalGenerarReporte = ({ onClose }) => {
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [cargando, setCargando] = useState(false);

  const calcularDomingoAnterior = (fechaStr) => {
    const d = new Date(fechaStr + "T12:00:00");
    const diaSemana = d.getDay();
    d.setDate(d.getDate() - diaSemana);
    return d.toISOString().split("T")[0];
  };

  const fechaInicio = calcularDomingoAnterior(fechaFin);

  const verificarSaltoPagina = (doc, finalY, espacioNecesario = 40) => {
    if (finalY + espacioNecesario > 280) {
      doc.addPage();
      return 20; // Nuevo finalY al inicio de la página
    }
    return finalY;
  };

  const generarPDF = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(
        `http://localhost:3000/api/reportes?inicio=${fechaInicio}&fin=${fechaFin}`,
        { headers },
      );
      const {
        finanzas,
        trabajos,
        inventario_critico,
        clientes_nuevos,
        inventario_usado,
      } = res.data;

      const doc = new jsPDF();
      const colorPrimario = [15, 23, 42];
      const colorSecundario = [100, 116, 139];

      // CABECERA INSTITUCIONAL
      doc.setFontSize(24);
      doc.setTextColor(...colorPrimario);
      doc.setFont("helvetica", "bold");
      doc.text("Zapatería y Maletería Daniel", 14, 22);

      doc.setFontSize(10);
      doc.setTextColor(...colorSecundario);
      doc.setFont("helvetica", "normal");
      doc.text("Dir: Cesar Endara N64-384 y Mariano Burbano", 14, 29);
      doc.text("Tel: 098 784 2660", 14, 34);
      doc.text(
        `Período del Reporte: Domingo ${fechaInicio} al ${fechaFin}`,
        14,
        39,
      );
      doc.text("Sistema: Mi Taller al Día", 14, 44);

      let currentY = 55;

      // 1. RESUMEN FINANCIERO
      const totalIngresos = finanzas.reduce(
        (sum, f) => sum + parseFloat(f.total || 0),
        0,
      );
      const totalEfectivo = finanzas
        .filter((f) => f.metodo_pago === "Efectivo")
        .reduce((sum, f) => sum + parseFloat(f.total || 0), 0);

      doc.setFontSize(14);
      doc.setTextColor(...colorPrimario);
      doc.setFont("helvetica", "bold");
      doc.text("1. Resumen Financiero", 14, currentY);

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Métrica", "Monto"]],
        body: [
          ["Total Ingresos en el período", `$${totalIngresos.toFixed(2)}`],
          ["Ingresos en Efectivo", `$${totalEfectivo.toFixed(2)}`],
          [
            "Ingresos por Transferencia",
            `$${(totalIngresos - totalEfectivo).toFixed(2)}`,
          ],
        ],
        theme: "grid",
        headStyles: { fillColor: [248, 250, 252], textColor: colorPrimario },
        styles: { fontSize: 10 },
      });

      currentY = verificarSaltoPagina(doc, doc.lastAutoTable.finalY + 15);

      // 2. ÓRDENES INGRESADAS
      doc.setFontSize(14);
      doc.text("2. Órdenes de Trabajo Ingresadas", 14, currentY);

      const trabajosRows = trabajos.map((t) => [
        `#${t.id_trabajo}`,
        t.nombre_completo,
        t.descripcion_producto,
        t.estado,
        `$${parseFloat(t.precio).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Orden", "Cliente", "Artículos", "Estado", "Precio"]],
        body:
          trabajosRows.length > 0
            ? trabajosRows
            : [["-", "No hubo ingresos en este período", "-", "-", "-"]],
        theme: "grid",
        headStyles: { fillColor: [238, 242, 255], textColor: colorPrimario },
        styles: { fontSize: 9 },
      });

      currentY = verificarSaltoPagina(doc, doc.lastAutoTable.finalY + 15);

      // 3. NUEVOS CLIENTES
      doc.setFontSize(14);
      doc.text("3. Nuevos Clientes Registrados", 14, currentY);

      const clientesRows =
        clientes_nuevos && clientes_nuevos.length > 0
          ? clientes_nuevos.map((c) => [c.nombre_completo, c.telefono || "N/A"])
          : [["No se registraron clientes nuevos en este período", "-"]];

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Nombre Completo", "Teléfono"]],
        body: clientesRows,
        theme: "grid",
        headStyles: { fillColor: [240, 253, 244], textColor: [22, 101, 52] }, // Verde tenue
        styles: { fontSize: 9 },
      });

      currentY = verificarSaltoPagina(doc, doc.lastAutoTable.finalY + 15);

      // 4. INVENTARIO USADO
      doc.setFontSize(14);
      doc.setTextColor(...colorPrimario);
      doc.text("4. Inventario Utilizado", 14, currentY);

      const usadoRows =
        inventario_usado && inventario_usado.length > 0
          ? inventario_usado.map((i) => [i.nombre, i.cantidad_usada])
          : [["No hay registro de consumo en este período", "-"]];

      autoTable(doc, {
        startY: currentY + 5,
        head: [["Material / Insumo", "Cantidad Usada"]],
        body: usadoRows,
        theme: "grid",
        headStyles: { fillColor: [248, 250, 252], textColor: colorPrimario },
        styles: { fontSize: 9 },
      });

      currentY = verificarSaltoPagina(doc, doc.lastAutoTable.finalY + 15);

      // 5. INVENTARIO CRÍTICO (Solo si hay alertas)
      if (inventario_critico && inventario_critico.length > 0) {
        doc.setFontSize(14);
        doc.text("5. Alertas de Inventario (Por Comprar)", 14, currentY);

        const inventarioRows = inventario_critico.map((i) => [
          i.nombre,
          i.stock_minimo,
          i.cantidad_actual,
        ]);

        autoTable(doc, {
          startY: currentY + 5,
          head: [["Material", "Stock Mínimo", "Stock Actual"]],
          body: inventarioRows,
          theme: "grid",
          headStyles: { fillColor: [254, 242, 242], textColor: [153, 27, 27] }, // Rojo tenue
          styles: { fontSize: 9 },
        });
      }

      doc.save(`Reporte_Semanal_${fechaInicio}_a_${fechaFin}.pdf`);
      onClose();
    } catch (error) {
      console.error("Error generando reporte:", error);
      alert("Error al obtener los datos para el reporte.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 max-w-md w-full shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 border-b-2 border-slate-50 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-700 rounded-full">
              <FileText size={28} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">
                Generar Reporte
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors border border-slate-200 shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-indigo-800 text-sm font-medium">
            El reporte semanal siempre comienza desde el <b>Domingo</b> anterior
            hasta la fecha que selecciones.
          </div>

          <div>
            <label className="block text-slate-800 font-bold text-sm mb-2 ml-1">
              Fecha Límite (Día actual o anterior)
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700 bg-slate-50"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-500">Desde (Domingo):</span>
              <span className="text-slate-800">{fechaInicio}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-500">Hasta (Seleccionado):</span>
              <span className="text-slate-800">{fechaFin}</span>
            </div>
          </div>

          <button
            onClick={generarPDF}
            disabled={cargando}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-black rounded-2xl transition-colors shadow-lg shadow-indigo-600/30 flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {cargando ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Download size={24} />
            )}
            {cargando ? "Generando PDF..." : "Descargar PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGenerarReporte;
