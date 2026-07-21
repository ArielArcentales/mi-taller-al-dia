import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Calendar } from "lucide-react";

import ResumenFinanciero from "../components/finanzas/ResumenFinanciero";
import DirectorioFinanzas from "../components/finanzas/DirectorioFinanzas";
import ModalCalendarioFinanzas from "../components/finanzas/ModalCalendarioFinanzas";

const Finanzas = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroTiempo, setFiltroTiempo] = useState("todas");
  const [filtroMetodo, setFiltroMetodo] = useState("");
  const [mostrarDropdownMetodo, setMostrarDropdownMetodo] = useState(false);

  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  const obtenerLibroMayor = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [resNotas, resTrabajos] = await Promise.all([
        axios.get("http://localhost:3000/api/notas-venta", { headers }),
        axios.get("http://localhost:3000/api/trabajos", { headers }),
      ]);

      const notasReales = resNotas.data || [];
      const trabajos = resTrabajos.data || [];
      const catalogoCompleto = [];

      // ====================================================================
      // 1. REGISTRAR TODOS LOS ABONOS
      // ====================================================================
      trabajos.forEach((t) => {
        if (parseFloat(t.abono) > 0) {
          const numeroFormateado = String(t.id_trabajo).padStart(5, "0");
          catalogoCompleto.push({
            id_transaccion: `abono-${t.id_trabajo}`,
            numero_comprobante: `ANT-${numeroFormateado}`,
            nombre_completo: t.nombre_completo || "Cliente del Taller",
            telefono: t.telefono,
            descripcion_producto: `${t.descripcion_producto} (Abono inicial)`,
            metodo_pago: "Efectivo",
            total: parseFloat(t.abono),
            fecha_emision:
              t.fecha_ingreso ||
              t.fecha_entrega_prometida ||
              new Date().toISOString(),
            detalles_adicionales: "Abono registrado al crear la orden",
            es_anticipo: true,
            // NUEVOS CAMPOS PARA EL PDF DETALLADO:
            articulos: t.articulos || [],
            precio_total_orden: parseFloat(t.precio || 0),
            abono_pagado: parseFloat(t.abono || 0),
            tipo_recibo: "anticipo",
          });
        }
      });

      // ====================================================================
      // 2. REGISTRAR LOS COBROS FINALES / NOTAS DE VENTA
      // ====================================================================
      notasReales.forEach((nota) => {
        const trabajoAsociado = trabajos.find(
          (t) => t.id_trabajo === nota.id_trabajo,
        );
        let saldoCobrado = parseFloat(nota.total || 0);
        let esPagoDeSaldo = false;

        if (trabajoAsociado) {
          const precioTotal = parseFloat(trabajoAsociado.precio || 0);
          const abonoPrevio = parseFloat(trabajoAsociado.abono || 0);
          saldoCobrado = precioTotal - abonoPrevio;
          if (abonoPrevio > 0) esPagoDeSaldo = true;
        }

        if (saldoCobrado > 0) {
          let numComprobante = nota.numero_comprobante || "";
          if (numComprobante.includes("COMPROBANTE-")) {
            const num = numComprobante.split("-")[1];
            numComprobante = `NV-${String(num).padStart(5, "0")}`;
          }

          if (trabajoAsociado) {
            catalogoCompleto.push({
              id_transaccion: `real-${nota.id_nota_venta}`,
              numero_comprobante: numComprobante,
              nombre_completo: nota.nombre_completo,
              telefono: nota.telefono,
              descripcion_producto:
                nota.descripcion_producto +
                (esPagoDeSaldo ? " (Cobro de saldo final)" : ""),
              metodo_pago: nota.metodo_pago,
              total: saldoCobrado,
              fecha_emision: nota.fecha_emision,
              detalles_adicionales: nota.detalles_adicionales,
              es_anticipo: false,
              // NUEVOS CAMPOS PARA EL PDF DETALLADO:
              articulos: trabajoAsociado.articulos || [],
              precio_total_orden: parseFloat(trabajoAsociado.precio || 0),
              abono_previo: parseFloat(trabajoAsociado.abono || 0),
              saldo_pagado: saldoCobrado,
              tipo_recibo: "saldo",
            });
          } else {
            // Nota de venta manual (Sin orden asociada)
            catalogoCompleto.push({
              id_transaccion: `real-${nota.id_nota_venta}`,
              numero_comprobante: numComprobante,
              nombre_completo: nota.nombre_completo,
              telefono: nota.telefono,
              descripcion_producto: nota.descripcion_producto,
              metodo_pago: nota.metodo_pago,
              total: saldoCobrado,
              fecha_emision: nota.fecha_emision,
              detalles_adicionales: nota.detalles_adicionales,
              es_anticipo: false,
              articulos: [],
              precio_total_orden: saldoCobrado,
              tipo_recibo: "directo",
            });
          }
        }
      });

      setTransacciones(
        catalogoCompleto.sort(
          (a, b) => new Date(b.fecha_emision) - new Date(a.fecha_emision),
        ),
      );
    } catch (error) {
      console.error("Error consolidando el libro mayor contable:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await obtenerLibroMayor();
    };
    cargarDatos();
  }, []);

  const manejarSeleccionFecha = (fecha) => {
    setFechaSeleccionada(fecha);
    setFiltroTiempo("calendario");
    setMostrarCalendario(false);
  };

  const transaccionesFiltradas = transacciones.filter((tx) => {
    const cumpleBusqueda =
      tx.numero_comprobante?.toLowerCase().includes(busqueda.toLowerCase()) ||
      tx.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleMetodo = filtroMetodo === "" || tx.metodo_pago === filtroMetodo;

    let cumpleTiempo = true;

    if (filtroTiempo !== "todas" && tx.fecha_emision) {
      const dTx = new Date(tx.fecha_emision);
      if (dTx.getHours() >= 21) dTx.setDate(dTx.getDate() + 1);
      dTx.setHours(0, 0, 0, 0);

      const dHoy = new Date();
      if (dHoy.getHours() >= 21) dHoy.setDate(dHoy.getDate() + 1);
      dHoy.setHours(0, 0, 0, 0);

      if (filtroTiempo === "hoy") {
        cumpleTiempo = dTx.getTime() === dHoy.getTime();
      } else if (filtroTiempo === "semana") {
        const hace7Dias = new Date(dHoy);
        hace7Dias.setDate(dHoy.getDate() - 7);
        cumpleTiempo = dTx >= hace7Dias;
      } else if (filtroTiempo === "calendario" && fechaSeleccionada) {
        const dSel = new Date(fechaSeleccionada);
        dSel.setHours(0, 0, 0, 0);
        cumpleTiempo = dTx.getTime() === dSel.getTime();
      }
    }

    return cumpleBusqueda && cumpleMetodo && cumpleTiempo;
  });

  const ingresosTotales = transaccionesFiltradas.reduce(
    (sum, t) => sum + parseFloat(t.total || 0),
    0,
  );
  const totalEfectivo = transaccionesFiltradas
    .filter((t) => t.metodo_pago === "Efectivo")
    .reduce((sum, t) => sum + parseFloat(t.total || 0), 0);
  const totalTransferencia = ingresosTotales - totalEfectivo;

  const formatearDinero = (valor) => {
    return new Intl.NumberFormat("es-US", {
      style: "currency",
      currency: "USD",
    }).format(valor);
  };

  const descargarPDF = (tx) => {
    const doc = new jsPDF();
    const colorPrimario = [15, 23, 42];
    const colorBordes = [148, 163, 184];

    // ==========================================
    // CABECERA DEL PDF
    // ==========================================
    doc.setFontSize(26);
    doc.setTextColor(...colorPrimario);
    doc.setFont("helvetica", "bold");
    doc.text("Mi Taller al Día", 14, 25);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text("Reparación y mantenimiento integral de calzado", 14, 32);

    doc.setFontSize(10);
    doc.setTextColor(...colorPrimario);
    doc.setFont("helvetica", "bold");
    doc.text("Tel: 098 784 2660", 196, 25, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.text("Dir: Cesar Endara N64-384 y Mariano Burbano", 196, 31, {
      align: "right",
    });

    doc.setDrawColor(...colorBordes);
    doc.setLineWidth(0.4);
    doc.roundedRect(135, 40, 61, 18, 2, 2);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colorPrimario);
    doc.text(
      tx.es_anticipo ? "RECIBO DE ANTICIPO" : "NOTA DE VENTA",
      165.5,
      48,
      { align: "center" },
    );

    doc.setFontSize(14);
    doc.setTextColor(220, 38, 38);
    doc.text(`Nº ${tx.numero_comprobante || "00000"}`, 165.5, 55, {
      align: "center",
    });

    const fecha = new Date(tx.fecha_emision);
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = String(fecha.getFullYear());

    doc.setDrawColor(...colorBordes);
    doc.roundedRect(14, 40, 45, 18, 2, 2);
    doc.line(14, 48, 59, 48);
    doc.line(29, 40, 29, 58);
    doc.line(44, 40, 44, 58);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text("DIA", 21.5, 45, { align: "center" });
    doc.text("MES", 36.5, 45, { align: "center" });
    doc.text("AÑO", 51.5, 45, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor(...colorPrimario);
    doc.setFont("helvetica", "bold");
    doc.text(dia, 21.5, 55, { align: "center" });
    doc.text(mes, 36.5, 55, { align: "center" });
    doc.text(anio, 51.5, 55, { align: "center" });

    // ==========================================
    // DATOS DEL CLIENTE
    // ==========================================
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 14, 70);
    doc.setFont("helvetica", "normal");
    doc.text(tx.nombre_completo || "Consumidor Final", 30, 70);
    doc.line(30, 71, 120, 71);

    doc.setFont("helvetica", "bold");
    doc.text("Teléfono:", 130, 70);
    doc.setFont("helvetica", "normal");
    doc.text(tx.telefono || "N/A", 148, 70);
    doc.line(148, 71, 196, 71);

    // ==========================================
    // TABLA DINÁMICA DE ARTÍCULOS
    // ==========================================
    const tableColumn = ["CANT.", "DESCRIPCIÓN DEL ARTÍCULO", "V. UNITARIO"];
    let tableRows;

    // Si existen artículos desglosados, creamos una fila por cada uno
    if (
      tx.articulos &&
      Array.isArray(tx.articulos) &&
      tx.articulos.length > 0
    ) {
      tableRows = tx.articulos.map((art) => [
        "1",
        `${art.producto || ""} ${art.reparacion ? `(${art.reparacion})` : ""}`,
        `$${parseFloat(art.precio || 0).toFixed(2)}`,
      ]);
    } else {
      // Si no hay artículos (ej. nota manual), ponemos todo en una línea
      tableRows = [
        [
          "1",
          tx.descripcion_producto || "Servicio de reparación",
          `$${parseFloat(tx.precio_total_orden || tx.total).toFixed(2)}`,
        ],
      ];
    }

    autoTable(doc, {
      startY: 82,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [248, 250, 252],
        textColor: colorPrimario,
        fontStyle: "bold",
        lineColor: colorBordes,
        lineWidth: 0.2,
        halign: "center",
      },
      bodyStyles: { lineColor: colorBordes, lineWidth: 0.2 },
      styles: { fontSize: 9, cellPadding: 5 },
      columnStyles: {
        0: { cellWidth: 20, halign: "center" },
        1: { cellWidth: 130 },
        2: { cellWidth: 32, halign: "center", fontStyle: "bold" },
      },
    });

    // ==========================================
    // SECCIÓN DE TOTALES INTELIGENTE
    // ==========================================
    const finalY = doc.lastAutoTable.finalY;

    doc.setDrawColor(...colorBordes);
    doc.setFillColor(248, 250, 252);

    if (tx.tipo_recibo === "anticipo") {
      // Bloque para Anticipos (3 líneas)
      doc.rect(120, finalY, 76, 22, "FD");
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("TOTAL ORDEN:", 125, finalY + 6);
      doc.text(`$${tx.precio_total_orden.toFixed(2)}`, 190, finalY + 6, {
        align: "right",
      });

      doc.text("ABONO (ESTE RECIBO):", 125, finalY + 12);
      doc.text(`$${tx.abono_pagado.toFixed(2)}`, 190, finalY + 12, {
        align: "right",
      });

      doc.setFont("helvetica", "bold");
      doc.text("SALDO PENDIENTE:", 125, finalY + 18);
      doc.text(
        `$${(tx.precio_total_orden - tx.abono_pagado).toFixed(2)}`,
        190,
        finalY + 18,
        { align: "right" },
      );
    } else if (tx.tipo_recibo === "saldo") {
      // Bloque para Saldo Final (3 líneas)
      doc.rect(120, finalY, 76, 22, "FD");
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("TOTAL ORDEN:", 125, finalY + 6);
      doc.text(`$${tx.precio_total_orden.toFixed(2)}`, 190, finalY + 6, {
        align: "right",
      });

      doc.text("ABONO PREVIO:", 125, finalY + 12);
      doc.text(`$${tx.abono_previo.toFixed(2)}`, 190, finalY + 12, {
        align: "right",
      });

      doc.setFont("helvetica", "bold");
      doc.text("TOTAL PAGADO HOY:", 125, finalY + 18);
      doc.text(`$${tx.saldo_pagado.toFixed(2)}`, 190, finalY + 18, {
        align: "right",
      });
    } else {
      // Bloque Clásico para cobro completo o manual (1 línea)
      doc.rect(130, finalY, 66, 10, "FD");
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL PAGADO", 135, finalY + 6.5);
      doc.text(`$${parseFloat(tx.total).toFixed(2)}`, 190, finalY + 6.5, {
        align: "right",
      });
    }

    // ==========================================
    // TEXTO LEGAL INFERIOR
    // ==========================================
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    const yTextoLegal = finalY + (tx.tipo_recibo !== "directo" ? 35 : 25);
    const legalText =
      "Esta nota de venta es un documento de control interno para la entrega y recepción de servicios/productos en el taller. NO ES VÁLIDA COMO FACTURA, no sustenta crédito tributario y no está sujeta a fines legales o tributarios según la normativa vigente del SRI.";
    doc.text(legalText, 105, yTextoLegal, { align: "center", maxWidth: 180 });

    doc.save(`Comprobante_${tx.numero_comprobante}.pdf`);
  };

  return (
    <>
      {mostrarCalendario && (
        <ModalCalendarioFinanzas
          onClose={() => setMostrarCalendario(false)}
          onSeleccionarFecha={manejarSeleccionFecha}
          transacciones={transacciones}
        />
      )}

      <div className="flex flex-col gap-4 h-[calc(100vh-80px)] w-full overflow-hidden relative z-0 pb-6">
        <header className="shrink-0 pt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-800">
              Gestión Financiera
            </h2>
            <p className="text-md text-slate-600 mt-1">
              Control de caja, comprobantes y anticipos históricos
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border-2 border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
              {[
                { id: "hoy", label: "Hoy" },
                { id: "semana", label: "Esta Semana" },
                { id: "todas", label: "Histórico" },
              ].map((rango) => (
                <button
                  key={rango.id}
                  onClick={() => {
                    setFiltroTiempo(rango.id);
                    setFechaSeleccionada(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                    filtroTiempo === rango.id
                      ? "bg-taller-900 text-white shadow-md"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  {rango.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMostrarCalendario(true)}
              className={`p-2 rounded-xl border-2 transition-all shadow-sm ${
                filtroTiempo === "calendario"
                  ? "bg-emerald-100 border-emerald-500 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
              title="Buscar ingresos por fecha"
            >
              <Calendar size={20} />
            </button>
          </div>
        </header>

        <ResumenFinanciero
          ingresosTotales={ingresosTotales}
          totalEfectivo={totalEfectivo}
          totalTransferencia={totalTransferencia}
          formatearDinero={formatearDinero}
        />

        <DirectorioFinanzas
          transacciones={transaccionesFiltradas}
          cargando={cargando}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          filtroMetodo={filtroMetodo}
          setFiltroMetodo={setFiltroMetodo}
          mostrarDropdownMetodo={mostrarDropdownMetodo}
          setMostrarDropdownMetodo={setMostrarDropdownMetodo}
          formatearDinero={formatearDinero}
          onDescargarPDF={descargarPDF}
          filtroTiempo={filtroTiempo}
          fechaSeleccionada={fechaSeleccionada}
        />
      </div>
    </>
  );
};

export default Finanzas;
