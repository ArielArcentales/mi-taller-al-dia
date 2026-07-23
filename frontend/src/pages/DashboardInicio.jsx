import { useState, useEffect } from "react";
import {
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Banknote,
  Package,
  Plus,
  Users,
  CheckCircle,
  ArrowRight,
  FileText,
  Archive,
  Bell,
} from "lucide-react";
import { Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import ModalTrabajosAnulados from "../components/trabajos/ModalTrabajosAnulados";
import ModalGenerarReporte from "../components/finanzas/ModalGenerarReporte";

const DashboardInicio = () => {
  const [datos, setDatos] = useState(null);
  const [trabajosLista, setTrabajosLista] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [ingresosHoy, setIngresosHoy] = useState(0);

  // Estados para los nuevos Modales
  const [mostrarModalAnulados, setMostrarModalAnulados] = useState(false);
  const [mostrarModalReporte, setMostrarModalReporte] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);

  // Lazy Initial State para notificaciones (sin advertencias del linter)
  const [notificaciones] = useState(() => {
    const notifsGuardadas =
      JSON.parse(localStorage.getItem("taller_notificaciones")) || [];
    const hoyLocal = new Date().toLocaleDateString("es-ES");
    return notifsGuardadas.filter((n) => n.fecha === hoyLocal);
  });

  const usuarioInfo = JSON.parse(localStorage.getItem("usuario")) || {
    username: "Ariel",
  };
  const opcionesFecha = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const fechaHoyStr = new Date().toLocaleDateString("es-ES", opcionesFecha);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const [resDashboard, resNotas, resTrabajos] = await Promise.all([
          axiosClient.get("/dashboard"),
          axiosClient.get("/notas-venta"),
          axiosClient.get("/trabajos"),
        ]);

        setDatos(resDashboard.data);
        setTrabajosLista(resTrabajos.data || []);

        const notasReales = resNotas.data || [];
        const trabajos = resTrabajos.data || [];
        let totalCajaHoy = 0;

        const obtenerFechaContable = (fecha) => {
          if (!fecha) return null;
          const d = new Date(fecha);
          if (d.getHours() >= 21) d.setDate(d.getDate() + 1);
          return d.toDateString();
        };
        //... (el resto de tu lógica se mantiene igual)

        const hoyContableStr = obtenerFechaContable(new Date());

        // ====================================================================
        // FASE 1: DINERO QUE ENTRÓ HOY POR ABONOS
        // ====================================================================
        trabajos.forEach((t) => {
          const fechaIngreso = t.fecha_ingreso;

          if (
            fechaIngreso &&
            obtenerFechaContable(fechaIngreso) === hoyContableStr
          ) {
            totalCajaHoy += parseFloat(t.abono || 0);
          }
        });

        // ====================================================================
        // FASE 2: DINERO QUE ENTRÓ HOY POR ENTREGAS (Saldos pagados)
        // ====================================================================
        notasReales.forEach((nota) => {
          if (
            nota.fecha_emision &&
            obtenerFechaContable(nota.fecha_emision) === hoyContableStr
          ) {
            const trabajoAsociado = trabajos.find(
              (t) => t.id_trabajo === nota.id_trabajo,
            );

            if (trabajoAsociado) {
              const precioTotal = parseFloat(trabajoAsociado.precio || 0);
              const abonoPrevio = parseFloat(trabajoAsociado.abono || 0);
              const saldoCobradoHoy = precioTotal - abonoPrevio;

              if (saldoCobradoHoy > 0) {
                totalCajaHoy += saldoCobradoHoy;
              }
            } else {
              // Notas de venta manuales (sin orden asociada)
              totalCajaHoy += parseFloat(nota.total || 0);
            }
          }
        });

        setIngresosHoy(totalCajaHoy);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDashboard();
  }, []);

  if (cargando) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-6">
        <Loader2 className="animate-spin text-taller-500" size={80} />
        <p className="text-3xl font-bold">Preparando su tablero...</p>
      </div>
    );
  }

  if (!datos) return null;

  const trabajosListos = trabajosLista.filter((t) => t.estado === "Listo");
  const inventarioBajo = datos.alertas.inventario_bajo || [];
  const trabajosAnulados = datos.anulados || [];

  return (
    <>
      {mostrarModalAnulados && (
        <ModalTrabajosAnulados
          anulados={trabajosAnulados}
          onClose={() => setMostrarModalAnulados(false)}
        />
      )}

      {mostrarModalReporte && (
        <ModalGenerarReporte onClose={() => setMostrarModalReporte(false)} />
      )}

      <div className="flex flex-col h-[calc(100vh-80px)] .min-h-[600px] w-full gap-6 p-2 lg:p-4 overflow-hidden">
        {/* ========================================================================= */}
        {/* CABECERA CON CAMPANA DE NOTIFICACIONES */}
        {/* ========================================================================= */}
        <div className="shrink-0 flex flex-col md:flex-row md:items-start justify-between gap-4 px-2">
          <div>
            <h1 className="text-5xl font-black text-slate-800 tracking-tight">
              ¡Buenos días,{" "}
              <span className="text-taller-600 capitalize">
                {usuarioInfo.username}
              </span>
              !
            </h1>
            <p className="text-2xl text-slate-500 font-medium mt-1 capitalize">
              {fechaHoyStr}
            </p>
          </div>

          <div className="relative z-50">
            <button
              onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
              className={`relative p-4 transition-colors rounded-2xl border-2 ${mostrarNotificaciones ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"}`}
            >
              <Bell size={32} />
              {notificaciones.length > 0 && (
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white text-sm font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {notificaciones.length}
                </span>
              )}
            </button>

            {mostrarNotificaciones && (
              <div className="absolute right-0 top-full mt-4 w-80 bg-white border-2 border-slate-100 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-black text-slate-800">
                    Registro de Mensajes
                  </span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-lg">
                    {notificaciones.length} hoy
                  </span>
                </div>
                <div className="p-2 max-h-72 overflow-y-auto custom-scrollbar">
                  {notificaciones.length > 0 ? (
                    notificaciones.map((notif, idx) => (
                      <div
                        key={idx}
                        className="p-4 hover:bg-slate-50 rounded-2xl transition-colors border-b border-slate-50 last:border-0"
                      >
                        <p className="text-sm font-bold text-slate-800">
                          {notif.texto}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs font-bold text-indigo-500">
                            {notif.detalle}
                          </p>
                          <p className="text-xs text-slate-400">
                            {notif.tiempo}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-sm font-medium">
                      No hay notificaciones registradas hoy.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL: ASIMETRÍA BENTO BOX (5 y 7) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0">
          {/* ========================================================================= */}
          {/* LADO IZQUIERDO (Ocupa 5/12): URGENCIAS Y LISTOS */}
          {/* ========================================================================= */}
          <div className="xl:col-span-5 flex flex-col gap-6 h-full min-h-0">
            {/* URGENCIAS */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col flex-1 min-h-0 overflow-hidden">
              <Link
                to="/dashboard/trabajos"
                className="p-5 border-b-2 border-slate-50 flex justify-between items-center bg-red-50 hover:bg-red-100 transition-colors shrink-0 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle size={32} className="text-red-600" />
                  <h3 className="text-2xl font-black text-red-800">
                    Urgencias
                  </h3>
                </div>
                <ArrowRight
                  size={28}
                  className="text-red-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all"
                />
              </Link>

              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {datos.alertas.trabajos_atrasados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 text-center">
                    <CheckCircle2
                      size={64}
                      className="text-emerald-400 opacity-30 mb-2"
                    />
                    <p className="text-2xl font-black text-slate-400">
                      Sin atrasos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {datos.alertas.trabajos_atrasados.map((t) => (
                      <div
                        key={t.id_trabajo}
                        className="p-5 bg-white border-l-8 .border-red-500 rounded-2xl shadow-sm border-y border-r border-slate-100 flex justify-between items-center gap-4"
                      >
                        <div className="overflow-hidden">
                          <p className="text-slate-500 font-bold text-lg mb-1">
                            Orden #{t.id_trabajo}
                          </p>
                          <h4 className="text-2xl font-black text-slate-800 leading-tight truncate">
                            {t.descripcion_producto}
                          </h4>
                        </div>
                        <p className="text-red-600 text-lg font-bold bg-red-50 px-3 py-2 rounded-lg border border-red-100 shrink-0 text-center leading-tight">
                          <span className="block text-xs uppercase text-red-400">
                            Atrasado
                          </span>
                          {new Date(
                            t.fecha_entrega_prometida,
                          ).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* LISTOS PARA RETIRAR */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col flex-1 min-h-0 overflow-hidden">
              <Link
                to="/dashboard/trabajos"
                className="p-5 border-b-2 border-slate-50 flex justify-between items-center bg-emerald-50 hover:bg-emerald-100 transition-colors shrink-0 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle size={32} className="text-emerald-600" />
                  <h3 className="text-2xl font-black text-emerald-800">
                    Listos
                  </h3>
                </div>
                <ArrowRight
                  size={28}
                  className="text-emerald-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all"
                />
              </Link>

              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                {trabajosListos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 text-center">
                    <Package
                      size={64}
                      className="text-slate-300 opacity-50 mb-2"
                    />
                    <p className="text-2xl font-black text-slate-400">
                      Nada por retirar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trabajosListos.map((t) => (
                      <div
                        key={t.id_trabajo}
                        className="p-5 bg-white border-l-8 .border-emerald-500 rounded-2xl shadow-sm border-y border-r border-slate-100"
                      >
                        <p className="text-slate-500 font-bold text-lg mb-1">
                          Orden #{t.id_trabajo}
                        </p>
                        <h4 className="text-2xl font-black text-slate-800 leading-tight mb-2 truncate">
                          {t.descripcion_producto}
                        </h4>
                        <p className="text-slate-700 text-lg font-bold flex items-center gap-2 truncate">
                          <Users
                            size={18}
                            className="text-slate-400 shrink-0"
                          />
                          {t.nombre_completo}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LADO DERECHO (Ocupa 7/12): TARJETAS TOP Y ÁREA INFERIOR */}
          {/* ========================================================================= */}
          <div className="xl:col-span-7 flex flex-col gap-6 h-full min-h-0">
            {/* FILA SUPERIOR DERECHA */}
            <div className="grid grid-cols-3 gap-6 shrink-0 h-48">
              {/* 1. CAJA HOY */}
              <Link
                to="/dashboard/finanzas"
                className="bg-linear-to-br from-emerald-400 to-emerald-600 rounded-[2.5rem] p-6 shadow-xl shadow-emerald-500/30 flex flex-col justify-between hover:scale-[1.02] transition-transform group"
              >
                <div className="flex justify-between items-start text-emerald-50">
                  <p className="text-lg font-black uppercase tracking-widest leading-tight">
                    Caja
                    <br />
                    Hoy
                  </p>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                    <Banknote size={28} />
                  </div>
                </div>
                <h2 className="text-4xl 2xl:text-5xl font-black text-white leading-none truncate">
                  ${ingresosHoy.toFixed(2)}
                </h2>
              </Link>

              {/* 2. NUEVO ENCARGO */}
              <Link
                to="/dashboard/trabajos"
                className="bg-taller-950 text-white rounded-[2.5rem] p-6 shadow-lg shadow-taller-950/20 flex flex-col justify-between hover:scale-[1.02] transition-transform group border-2 border-taller-800"
              >
                <div className="flex justify-between items-start text-slate-300">
                  <p className="text-lg font-black uppercase tracking-widest leading-tight">
                    Nuevo
                    <br />
                    Encargo
                  </p>
                  <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                    <Plus size={28} className="text-white" />
                  </div>
                </div>
                <div className="text-right">
                  <ArrowRight
                    size={36}
                    className="text-taller-400 group-hover:text-white transition-colors inline-block"
                  />
                </div>
              </Link>

              {/* 3. DIRECTORIO DE CLIENTES */}
              <Link
                to="/dashboard/clientes"
                className="bg-white rounded-[2.5rem] p-6 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform group border-4 border-slate-100 hover:border-taller-200"
              >
                <div className="flex justify-between items-start text-slate-400 group-hover:text-taller-500 transition-colors">
                  <p className="text-lg font-black uppercase tracking-widest leading-tight">
                    Ver
                    <br />
                    Clientes
                  </p>
                  <div className="p-3 bg-slate-100 group-hover:bg-taller-50 rounded-xl transition-colors">
                    <Users
                      size={28}
                      className="text-slate-600 group-hover:text-taller-600"
                    />
                  </div>
                </div>
                <div className="text-right">
                  <ArrowRight
                    size={36}
                    className="text-slate-300 group-hover:text-taller-500 transition-colors inline-block"
                  />
                </div>
              </Link>
            </div>

            {/* ÁREA INFERIOR DERECHA */}
            <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
              {/* 4. LISTA: POR COMPRAR */}
              <div className="col-span-1 bg-white rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col h-full overflow-hidden">
                <Link
                  to="/dashboard/inventario"
                  className="p-5 border-b-2 border-slate-50 flex justify-between items-center bg-amber-50 hover:bg-amber-100 transition-colors shrink-0 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Package size={28} className="text-amber-600" />
                    <h3 className="text-xl font-black text-amber-800">
                      Por Comprar
                    </h3>
                  </div>
                  <ArrowRight
                    size={24}
                    className="text-amber-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all"
                  />
                </Link>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {inventarioBajo.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 text-center">
                      <CheckCircle2
                        size={56}
                        className="text-amber-300 opacity-50 mb-2"
                      />
                      <p className="text-xl font-black text-slate-400">
                        Todo en Stock
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {inventarioBajo.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 bg-white border-l-8 .border-amber-500 rounded-2xl shadow-sm flex flex-col border-y border-r border-slate-100 relative"
                        >
                          <h4 className="text-lg font-black text-slate-800 leading-tight truncate pr-8">
                            {item.nombre}
                          </h4>
                          <p className="text-slate-500 font-bold text-xs uppercase tracking-wide mt-1">
                            Min: {item.stock_minimo}
                          </p>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                            <p className="text-xl font-black text-amber-600 leading-none text-center">
                              {item.cantidad_actual}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 5. NUEVOS BOTONES DE ACCIÓN */}
              <div className="col-span-1 flex flex-col gap-6 h-full min-h-0">
                {/* BOTÓN: GENERAR REPORTE */}
                <button
                  onClick={() => setMostrarModalReporte(true)}
                  className="flex-1 w-full bg-white border-4 border-slate-100 rounded-[2.5rem] p-6 shadow-sm flex flex-col items-center justify-center gap-3 hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-slate-700 hover:text-indigo-800 group cursor-pointer"
                >
                  <div className="p-3 bg-slate-100 group-hover:bg-indigo-100 rounded-full transition-colors">
                    <FileText
                      size={36}
                      className="text-slate-500 group-hover:text-indigo-600"
                    />
                  </div>
                  <span className="text-2xl font-black text-center leading-tight">
                    Generar
                    <br />
                    Reporte
                  </span>
                </button>

                {/* BOTÓN: TRABAJOS ANULADOS */}
                <button
                  onClick={() => setMostrarModalAnulados(true)}
                  className="flex-1 w-full bg-white border-4 border-slate-100 rounded-[2.5rem] p-6 shadow-sm flex flex-col items-center justify-center gap-3 hover:border-slate-300 hover:bg-slate-50 transition-colors text-slate-600 hover:text-slate-900 group cursor-pointer"
                >
                  <div className="p-3 bg-slate-100 group-hover:bg-slate-200 rounded-full transition-colors">
                    <Archive
                      size={36}
                      className="text-slate-500 group-hover:text-slate-700"
                    />
                  </div>
                  <span className="text-2xl font-black text-center leading-tight">
                    Trabajos
                    <br />
                    Anulados
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardInicio;
