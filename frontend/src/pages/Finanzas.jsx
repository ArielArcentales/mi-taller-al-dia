import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  DollarSign,
  Download,
  FileText,
  TrendingUp,
  CreditCard,
  Banknote,
  Loader2,
  CalendarCheck,
  ReceiptText,
  ChevronDown,
  Clock,
} from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Finanzas = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [cargando, setCargando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroTiempo, setFiltroTiempo] = useState("todas");
  const [filtroMetodo, setFiltroMetodo] = useState("");

  const [mostrarDropdownMetodo, setMostrarDropdownMetodo] = useState(false);

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

      notasReales.forEach((nota) => {
        let numComprobante = nota.numero_comprobante || "";
        if (numComprobante.includes("COMPROBANTE-")) {
          const num = numComprobante.split("-")[1];
          numComprobante = `NV-${String(num).padStart(5, "0")}`;
        }

        catalogoCompleto.push({
          id_transaccion: `real-${nota.id_nota_venta}`,
          numero_comprobante: numComprobante,
          nombre_completo: nota.nombre_completo,
          descripcion_producto: nota.descripcion_producto,
          metodo_pago: nota.metodo_pago,
          total: parseFloat(nota.total),
          fecha_emision: nota.fecha_emision,
          detalles_adicionales: nota.detalles_adicionales,
          es_anticipo: false,
        });
      });

      trabajos.forEach((t) => {
        const tieneNota = notasReales.some(
          (n) => n.id_trabajo === t.id_trabajo,
        );

        if (!tieneNota && parseFloat(t.abono) > 0) {
          const numeroFormateado = String(t.id_trabajo).padStart(5, "0");

          catalogoCompleto.push({
            id_transaccion: `prov-${t.id_trabajo}`,
            numero_comprobante:
              t.estado === "Entregado"
                ? `NV-${numeroFormateado}`
                : `ANT-${numeroFormateado}`,
            nombre_completo: t.nombre_completo || "Cliente del Taller",
            descripcion_producto: t.descripcion_producto,
            metodo_pago: "Efectivo",
            total: parseFloat(t.abono),
            fecha_emision:
              t.fecha_entrega_prometida || new Date().toISOString(),
            detalles_adicionales: "Abono histórico no facturado formalmente",
            es_anticipo: t.estado !== "Entregado",
          });
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

  const transaccionesFiltradas = transacciones.filter((tx) => {
    const cumpleBusqueda =
      tx.numero_comprobante?.toLowerCase().includes(busqueda.toLowerCase()) ||
      tx.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase());

    const cumpleMetodo = filtroMetodo === "" || tx.metodo_pago === filtroMetodo;

    let cumpleTiempo = true;

    if (filtroTiempo !== "todas" && tx.fecha_emision) {
      // CORTE DE CAJA A LAS 9 PM (21:00)
      const dTx = new Date(tx.fecha_emision);
      // Si la transacción se hizo a las 21:00 o después, cuenta para el día de mañana
      if (dTx.getHours() >= 21) {
        dTx.setDate(dTx.getDate() + 1);
      }

      const dHoy = new Date();
      if (dHoy.getHours() >= 21) {
        dHoy.setDate(dHoy.getDate() + 1);
      }

      if (filtroTiempo === "hoy") {
        cumpleTiempo = dTx.toDateString() === dHoy.toDateString();
      } else if (filtroTiempo === "semana") {
        const hace7Dias = new Date(dHoy);
        hace7Dias.setDate(dHoy.getDate() - 7);

        // Limpiamos las horas para comparar solo las fechas
        dTx.setHours(0, 0, 0, 0);
        hace7Dias.setHours(0, 0, 0, 0);

        cumpleTiempo = dTx >= hace7Dias;
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
    const colorPrimario = [30, 41, 59];

    doc.setFontSize(22);
    doc.setTextColor(...colorPrimario);
    doc.setFont("helvetica", "bold");
    doc.text("MI TALLER AL DÍA", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.setFont("helvetica", "normal");
    doc.text(
      tx.es_anticipo
        ? "Recibo de Anticipo"
        : "Comprobante de Reparación y Venta",
      105,
      28,
      { align: "center" },
    );

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 35, 196, 35);

    doc.setFontSize(11);
    doc.setTextColor(...colorPrimario);

    doc.setFont("helvetica", "bold");
    doc.text("Comprobante N°:", 14, 45);
    doc.setFont("helvetica", "normal");
    doc.text(tx.numero_comprobante || "N/A", 50, 45);

    doc.setFont("helvetica", "bold");
    doc.text("Fecha de Emisión:", 14, 52);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(tx.fecha_emision).toLocaleDateString(), 50, 52);

    doc.setFont("helvetica", "bold");
    doc.text("Cliente:", 110, 45);
    doc.setFont("helvetica", "normal");
    doc.text(tx.nombre_completo || "Consumidor Final", 130, 45);

    doc.setFont("helvetica", "bold");
    doc.text("Método de Pago:", 110, 52);
    doc.setFont("helvetica", "normal");
    doc.text(tx.metodo_pago || "Efectivo", 145, 52);

    const tableColumn = ["Descripción del Artículo / Trabajo", "Total Pagado"];
    const tableRows = [
      [
        tx.descripcion_producto || "Servicio de reparación",
        `$${parseFloat(tx.total).toFixed(2)}`,
      ],
    ];

    autoTable(doc, {
      startY: 65,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: colorPrimario,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { halign: "right", fontStyle: "bold" },
      },
    });

    if (tx.detalles_adicionales) {
      const finalY = doc.lastAutoTable.finalY || 65;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Notas Adicionales:", 14, finalY + 15);
      doc.setFont("helvetica", "normal");
      doc.text(tx.detalles_adicionales, 14, finalY + 22, { maxWidth: 180 });
    }

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text("¡Gracias por confiar en nuestros servicios!", 105, 280, {
      align: "center",
    });

    doc.save(`Comprobante_${tx.numero_comprobante}.pdf`);
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-80px)] min-h-125 w-full relative z-0 pb-6">
      <div className="shrink-0 pt-2 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <h2 className="text-4xl font-black text-slate-800">
            Gestión Financiera
          </h2>
          <p className="text-lg text-slate-600 mt-2">
            Control de caja, comprobantes y anticipos históricos
          </p>
        </div>

        <div className="flex items-center bg-white border-2 border-slate-200 rounded-2xl p-1.5 shadow-sm shrink-0">
          {[
            { id: "hoy", label: "Hoy" },
            { id: "semana", label: "Esta Semana" },
            { id: "todas", label: "Histórico" },
          ].map((rango) => (
            <button
              key={rango.id}
              onClick={() => setFiltroTiempo(rango.id)}
              className={`px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${
                filtroTiempo === rango.id
                  ? "bg-taller-900 text-white shadow-md"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              {rango.label}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 bg-white p-6 md:p-8 rounded-4xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-500 mb-6 flex items-center gap-2">
          <TrendingUp size={24} className="text-emerald-500" /> Resumen de
          Ingresos del Filtro
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden transition-colors hover:border-slate-200">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-slate-200 text-slate-700 rounded-2xl flex items-center justify-center shrink-0">
                <DollarSign size={24} />
              </div>
              <span className="text-md font-black uppercase tracking-wider text-slate-500">
                Total Recaudado
              </span>
            </div>
            <p className="text-5xl font-black text-slate-800 mt-2">
              {formatearDinero(ingresosTotales)}
            </p>
          </div>

          <div className="bg-emerald-50 border-2 border-emerald-100 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden transition-colors hover:border-emerald-200">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center shrink-0">
                <Banknote size={24} />
              </div>
              <span className="text-md font-black uppercase tracking-wider text-emerald-700">
                Efectivo Físico
              </span>
            </div>
            <p className="text-5xl font-black text-emerald-900 mt-2">
              {formatearDinero(totalEfectivo)}
            </p>
          </div>

          <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-6 flex flex-col justify-center relative overflow-hidden transition-colors hover:border-blue-200">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-blue-200 text-blue-800 rounded-2xl flex items-center justify-center shrink-0">
                <CreditCard size={24} />
              </div>
              <span className="text-md font-black uppercase tracking-wider text-blue-700">
                Transferencias
              </span>
            </div>
            <p className="text-5xl font-black text-blue-900 mt-2">
              {formatearDinero(totalTransferencia)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white p-6 md:p-8 rounded-4xl shadow-sm border border-slate-200 flex flex-col min-h-0 overflow-hidden">
        <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-5 mb-8">
          <h3 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <ReceiptText size={32} className="text-taller-600" />
            Libro Mayor Contable
          </h3>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar cliente o comprobante..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 text-md border-2 border-slate-200 rounded-2xl focus:border-taller-500 outline-none bg-slate-50 transition-all font-bold text-slate-700"
              />
            </div>

            <div className="relative shrink-0 sm:w-56">
              <button
                onClick={() => setMostrarDropdownMetodo(!mostrarDropdownMetodo)}
                className="w-full pl-11 pr-4 py-3.5 text-md border-2 border-slate-200 rounded-2xl outline-none text-left font-bold bg-slate-50 flex items-center justify-between"
              >
                <span className="flex items-center gap-2 truncate text-slate-700">
                  <Filter
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <span className="truncate">
                    {filtroMetodo || "Todos los pagos"}
                  </span>
                </span>
                <ChevronDown size={18} className="text-slate-400 shrink-0" />
              </button>

              {mostrarDropdownMetodo && (
                <div className="absolute right-0 top-full mt-2 w-full sm:w-64 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-50 flex flex-col max-h-72 overflow-y-auto custom-scrollbar">
                  <button
                    onClick={() => {
                      setFiltroMetodo("");
                      setMostrarDropdownMetodo(false);
                    }}
                    className="w-full p-4 hover:bg-slate-50 transition-colors text-left font-black text-slate-800 text-sm border-b border-slate-100"
                  >
                    Todos los métodos
                  </button>
                  <button
                    onClick={() => {
                      setFiltroMetodo("Efectivo");
                      setMostrarDropdownMetodo(false);
                    }}
                    className="w-full p-4 hover:bg-slate-50 transition-colors text-left font-bold text-slate-600 text-sm border-b border-slate-50"
                  >
                    Efectivo
                  </button>
                  <button
                    onClick={() => {
                      setFiltroMetodo("Transferencia");
                      setMostrarDropdownMetodo(false);
                    }}
                    className="w-full p-4 hover:bg-slate-50 transition-colors text-left font-bold text-slate-600 text-sm border-b border-slate-50"
                  >
                    Transferencia
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
          {cargando ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="text-xl font-bold">
                Consolidando flujos financieros...
              </p>
            </div>
          ) : transaccionesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
              <div className="p-6 bg-slate-100 rounded-full mb-4">
                <FileText size={56} className="text-slate-300" />
              </div>
              <p className="text-2xl font-black text-slate-500 mb-1">
                No hay movimientos
              </p>
              <p className="text-md font-medium mt-1">
                No se encontró dinero ingresado para este periodo.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {transaccionesFiltradas.map((tx) => {
                const esEfectivo = tx.metodo_pago === "Efectivo";
                const esAnticipo = tx.es_anticipo;

                return (
                  <div
                    key={tx.id_transaccion}
                    className={`p-5 border-2 ${esAnticipo ? "border-amber-100 bg-amber-50/30" : "border-slate-100 bg-slate-50"} hover:bg-white hover:border-slate-300 rounded-3xl transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5 group`}
                  >
                    <div className="flex items-center gap-5 overflow-hidden flex-1">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-2 ${esAnticipo ? "bg-amber-100 border-amber-200 text-amber-600" : "bg-slate-100 border-slate-200 text-slate-500"}`}
                      >
                        {esAnticipo ? (
                          <Clock size={24} />
                        ) : (
                          <FileText size={24} />
                        )}
                      </div>

                      <div className="overflow-hidden">
                        <h4 className="text-2xl font-black text-slate-800 leading-tight mb-1 truncate">
                          #{tx.numero_comprobante}
                        </h4>
                        <p className="text-md text-slate-600 font-medium truncate mb-2">
                          Cliente:{" "}
                          <span className="font-bold text-slate-800">
                            {tx.nombre_completo}
                          </span>
                        </p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="text-sm text-slate-500 font-bold flex items-center gap-1.5">
                            <CalendarCheck size={16} />
                            {new Date(tx.fecha_emision).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 border ${
                              esEfectivo
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-blue-100 text-blue-700 border-blue-200"
                            }`}
                          >
                            {esEfectivo ? (
                              <Banknote size={14} />
                            ) : (
                              <CreditCard size={14} />
                            )}
                            {tx.metodo_pago}
                          </span>
                          {esAnticipo && (
                            <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                              Anticipo Activo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 shrink-0 border-t md:border-t-0 border-slate-200 pt-4 md:pt-0 mt-2 md:mt-0 min-w-55">
                      <div className="text-left md:text-right">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                          {esAnticipo ? "Abono Recibido" : "Total Cobrado"}
                        </p>
                        <p className="text-3xl font-black text-slate-800 leading-none">
                          {formatearDinero(tx.total)}
                        </p>
                      </div>

                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => descargarPDF(tx)}
                          className="p-3 text-white bg-slate-800 hover:bg-slate-900 border border-slate-800 rounded-xl transition-colors shadow-md font-bold flex items-center gap-2"
                          title="Generar e imprimir PDF"
                        >
                          <Download size={20} />
                          <span className="hidden xl:block text-sm">
                            Descargar PDF
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Finanzas;
