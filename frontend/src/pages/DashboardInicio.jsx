import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Wrench,
  Package,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Banknote,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const DashboardInicio = () => {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ingresosHoy, setIngresosHoy] = useState(0);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [resDashboard, resNotas, resTrabajos] = await Promise.all([
          axios.get("http://localhost:3000/api/dashboard", { headers }),
          axios.get("http://localhost:3000/api/notas-venta", { headers }),
          axios.get("http://localhost:3000/api/trabajos", { headers }),
        ]);

        setDatos(resDashboard.data);

        const notasReales = resNotas.data || [];
        const trabajos = resTrabajos.data || [];
        let totalCajaHoy = 0;

        // LÓGICA DE CORTE DE CAJA A LAS 9 PM (21:00)
        // Función para calcular la "Fecha Contable" de cualquier registro
        const obtenerFechaContable = (fecha) => {
          const d = new Date(fecha);
          if (d.getHours() >= 21) {
            d.setDate(d.getDate() + 1); // Si son más de las 9PM, lo cuenta para mañana
          }
          return d.toDateString();
        };

        const hoyContableStr = obtenerFechaContable(new Date());

        notasReales.forEach((nota) => {
          if (
            nota.fecha_emision &&
            obtenerFechaContable(nota.fecha_emision) === hoyContableStr
          ) {
            totalCajaHoy += parseFloat(nota.total || 0);
          }
        });

        trabajos.forEach((t) => {
          const tieneNota = notasReales.some(
            (n) => n.id_trabajo === t.id_trabajo,
          );
          if (!tieneNota && parseFloat(t.abono) > 0) {
            const fechaTx =
              t.fecha_entrega_prometida || new Date().toISOString();
            if (obtenerFechaContable(fechaTx) === hoyContableStr) {
              totalCajaHoy += parseFloat(t.abono || 0);
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
      <div className="flex flex-col items-center justify-center h-[70vh] text-slate-400">
        <Loader2 className="animate-spin mb-4 text-taller-500" size={64} />
        <p className="text-2xl font-bold">Calculando métricas del taller...</p>
      </div>
    );
  }

  if (!datos) return null;

  const esperado = parseFloat(datos.finanzas.total_esperado || 0);
  const recibido = parseFloat(datos.finanzas.total_abonos || 0);
  const porCobrar = esperado - recibido;

  const totalActivos = datos.resumen_trabajos
    .filter((t) => ["Pendiente", "En Proceso", "Listo"].includes(t.estado))
    .reduce((acc, curr) => acc + parseInt(curr.total), 0);

  const getColorEstado = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "En Proceso":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Listo":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Entregado":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "Anulado":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-4xl font-black text-slate-800">Panel Principal</h2>
        <p className="text-xl text-slate-600 mt-2">
          Resumen operativo y financiero del taller.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Banknote size={32} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">
              Caja de Hoy
            </p>
            <h3 className="text-3xl font-black text-slate-800">
              ${ingresosHoy.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <DollarSign size={32} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">
              Abonos Histórico
            </p>
            <h3 className="text-3xl font-black text-slate-800">
              ${recibido.toFixed(2)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <TrendingUp size={32} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">
              Saldo por Cobrar
            </p>
            <h3 className="text-3xl font-black text-slate-800">
              ${porCobrar > 0 ? porCobrar.toFixed(2) : "0.00"}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Wrench size={32} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">
              Trabajos Activos
            </p>
            <h3 className="text-3xl font-black text-slate-800">
              {totalActivos}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="w-16 h-16 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Clock size={32} />
          </div>
          <div>
            <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">
              Atrasados
            </p>
            <h3 className="text-3xl font-black text-slate-800">
              {datos.alertas.trabajos_atrasados.length}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col .h-[500px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800">
                Urgente / Atrasados
              </h3>
            </div>
            <Link
              to="/trabajos"
              className="text-taller-600 hover:text-taller-800 font-bold flex items-center gap-1"
            >
              Ver todos <ArrowRight size={18} />
            </Link>
          </div>

          <div className="flex-1 overflow-auto p-6">
            {datos.alertas.trabajos_atrasados.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <CheckCircle2
                  size={64}
                  className="mb-4 text-emerald-400 opacity-50"
                />
                <p className="text-2xl font-bold text-slate-500">
                  ¡Todo al día!
                </p>
                <p className="text-lg">No hay entregas atrasadas.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {datos.alertas.trabajos_atrasados.map((t) => (
                  <div
                    key={t.id_trabajo}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-red-200 bg-red-50 rounded-xl gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-red-600 font-bold text-sm">
                          Orden #{t.id_trabajo}
                        </span>
                        <span className="text-xs bg-red-200 text-red-800 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                          Atrasado
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-800">
                        {t.descripcion_producto}
                      </h4>
                      <p className="text-slate-600 text-sm mt-1">
                        Cliente:{" "}
                        <span className="font-bold">{t.nombre_completo}</span>
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-bold text-slate-500 uppercase">
                        Debió entregarse el:
                      </p>
                      <p className="text-xl font-black text-red-600">
                        {new Date(
                          t.fecha_entrega_prometida,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="xl:col-span-1 flex flex-col gap-8 .h-[500px]">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
            <div className="p-5 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                Estado del Taller
              </h3>
            </div>
            <div className="p-5 overflow-auto">
              <div className="space-y-3">
                {[
                  "Pendiente",
                  "En Proceso",
                  "Listo",
                  "Entregado",
                  "Anulado",
                ].map((estadoBuscado) => {
                  const estadoData = datos.resumen_trabajos.find(
                    (r) => r.estado === estadoBuscado,
                  );
                  const cantidad = estadoData ? parseInt(estadoData.total) : 0;

                  return (
                    <div
                      key={estadoBuscado}
                      className={`flex justify-between items-center p-3 rounded-lg border bg-white ${estadoBuscado === "Anulado" ? "border-red-100" : "border-slate-100"}`}
                    >
                      <span
                        className={`font-bold ${estadoBuscado === "Anulado" ? "text-red-700" : "text-slate-700"}`}
                      >
                        {estadoBuscado}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-md font-black text-lg border ${getColorEstado(estadoBuscado)}`}
                      >
                        {cantidad}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-0">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Package size={20} className="text-amber-500" /> Stock Bajo
              </h3>
            </div>
            <div className="p-5 overflow-auto">
              {datos.alertas.inventario_bajo.length === 0 ? (
                <p className="text-center text-slate-500 font-medium mt-4">
                  El inventario está abastecido.
                </p>
              ) : (
                <div className="space-y-3">
                  {datos.alertas.inventario_bajo.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border border-amber-200 bg-amber-50 rounded-lg"
                    >
                      <div>
                        <p className="font-bold text-slate-800">
                          {item.nombre}
                        </p>
                        <p className="text-xs text-slate-500 uppercase tracking-wide">
                          {item.categoria}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-amber-600">
                          {item.cantidad_actual}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">
                          Min: {item.stock_minimo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardInicio;
