import { useState, useEffect } from "react";
import {
  Plus,
  Wrench,
  Calendar,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

const Trabajos = () => {
  const [clientes, setClientes] = useState([]);
  const [trabajos, setTrabajos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");

  const [nuevoTrabajo, setNuevoTrabajo] = useState({
    id_cliente: "",
    descripcion_producto: "",
    descripcion_reparacion: "",
    precio: "",
    abono: "",
    fecha_entrega_prometida: "",
  });

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const obtenerDatos = async (estado = "") => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(
        `http://localhost:3000/api/trabajos?estado=${estado}`,
        { headers },
      );
      setTrabajos(res.data);
    } catch (error) {
      console.error("Error al obtener trabajos:", error);
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const resClientes = await axios.get(
          "http://localhost:3000/api/clientes",
          { headers },
        );
        setClientes(resClientes.data);
        await obtenerDatos();
      } catch (error) {
        console.error("Error al inicializar datos:", error);
      }
    };
    inicializar();
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/trabajos/${id}/estado`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTrabajos(
        trabajos.map((t) =>
          t.id_trabajo === id ? { ...t, estado: nuevoEstado } : t,
        ),
      );
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo actualizar el estado");
    }
  };

  const registrarTrabajo = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:3000/api/trabajos",
        {
          ...nuevoTrabajo,
          precio: parseFloat(nuevoTrabajo.precio),
          abono: nuevoTrabajo.abono ? parseFloat(nuevoTrabajo.abono) : 0,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMensaje({ texto: "Orden creada con éxito", tipo: "exito" });
      setNuevoTrabajo({
        id_cliente: "",
        descripcion_producto: "",
        descripcion_reparacion: "",
        precio: "",
        abono: "",
        fecha_entrega_prometida: "",
      });
      obtenerDatos(filtroEstado);
    } catch (error) {
      console.error(error);
      setMensaje({
        texto: error.response?.data?.mensaje || "Error",
        tipo: "error",
      });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
    }
  };

  const getEstadoStyles = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "En Proceso":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Listo":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Entregado":
        return "bg-slate-100 text-slate-500 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const esAtrasado = (fecha) => {
    if (!fecha) return false;
    return (
      new Date(fecha) < new Date() &&
      new Date(fecha).toLocaleDateString() !== new Date().toLocaleDateString()
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-800">
            Órdenes de Trabajo
          </h2>
          <p className="text-xl text-slate-600 mt-2">
            Gestión del ciclo de vida de las reparaciones.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* FORMULARIO */}
        <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Plus className="text-taller-500" /> Nuevo Ingreso
          </h3>
          {mensaje.texto && (
            <div
              className={`p-4 rounded-xl mb-6 font-bold ${mensaje.tipo === "exito" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {mensaje.texto}
            </div>
          )}
          <form onSubmit={registrarTrabajo} className="space-y-4">
            <select
              name="id_cliente"
              required
              value={nuevoTrabajo.id_cliente}
              onChange={(e) =>
                setNuevoTrabajo({ ...nuevoTrabajo, id_cliente: e.target.value })
              }
              className="w-full p-4 text-lg border-2 rounded-xl outline-none focus:border-taller-500"
            >
              <option value="">Seleccionar Cliente...</option>
              {clientes.map((c) => (
                <option key={c.id_cliente} value={c.id_cliente}>
                  {c.nombre_completo}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="descripcion_producto"
              required
              placeholder="¿Qué zapato es?"
              value={nuevoTrabajo.descripcion_producto}
              onChange={(e) =>
                setNuevoTrabajo({
                  ...nuevoTrabajo,
                  descripcion_producto: e.target.value,
                })
              }
              className="w-full p-4 text-lg border-2 rounded-xl outline-none focus:border-taller-500"
            />
            <textarea
              name="descripcion_reparacion"
              required
              placeholder="Detalle de la reparación..."
              value={nuevoTrabajo.descripcion_reparacion}
              onChange={(e) =>
                setNuevoTrabajo({
                  ...nuevoTrabajo,
                  descripcion_reparacion: e.target.value,
                })
              }
              className="w-full p-4 text-lg border-2 rounded-xl outline-none focus:border-taller-500 resize-none h-24"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="precio"
                required
                placeholder="Precio $"
                value={nuevoTrabajo.precio}
                onChange={(e) =>
                  setNuevoTrabajo({ ...nuevoTrabajo, precio: e.target.value })
                }
                className="w-full p-4 text-lg border-2 rounded-xl outline-none focus:border-taller-500"
              />
              <input
                type="number"
                name="abono"
                placeholder="Abono $"
                value={nuevoTrabajo.abono}
                onChange={(e) =>
                  setNuevoTrabajo({ ...nuevoTrabajo, abono: e.target.value })
                }
                className="w-full p-4 text-lg border-2 rounded-xl outline-none focus:border-taller-500"
              />
            </div>
            <input
              type="date"
              name="fecha_entrega_prometida"
              value={nuevoTrabajo.fecha_entrega_prometida}
              onChange={(e) =>
                setNuevoTrabajo({
                  ...nuevoTrabajo,
                  fecha_entrega_prometida: e.target.value,
                })
              }
              className="w-full p-4 text-lg border-2 rounded-xl outline-none focus:border-taller-500"
            />
            <button
              disabled={guardando}
              className="w-full py-4 bg-taller-950 text-white rounded-xl text-xl font-bold hover:bg-taller-800 transition-colors flex justify-center items-center gap-2"
            >
              {guardando ? <Loader2 className="animate-spin" /> : <Save />}{" "}
              Registrar Orden
            </button>
          </form>
        </div>

        {/* LISTADO DINÁMICO */}
        <div className="xl:col-span-2 space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {["", "Pendiente", "En Proceso", "Listo", "Entregado"].map(
              (est) => (
                <button
                  key={est}
                  onClick={() => {
                    setFiltroEstado(est);
                    obtenerDatos(est);
                  }}
                  className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all ${filtroEstado === est ? "bg-taller-600 text-white shadow-lg" : "bg-white text-slate-600 border border-slate-200"}`}
                >
                  {est || "Todos"}
                </button>
              ),
            )}
          </div>

          <div className="grid gap-4">
            {trabajos.map((t) => (
              <div
                key={t.id_trabajo}
                className={`bg-white p-6 rounded-2xl border-l-8 shadow-sm flex flex-col md:flex-row justify-between gap-6 transition-all ${t.estado === "Entregado" ? "opacity-60 border-slate-300" : "border-taller-500"}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-black border ${getEstadoStyles(t.estado)}`}
                    >
                      {t.estado.toUpperCase()}
                    </span>
                    {esAtrasado(t.fecha_entrega_prometida) &&
                      t.estado !== "Entregado" && (
                        <span className="flex items-center gap-1 text-red-600 font-bold text-sm animate-pulse">
                          <AlertCircle size={16} /> ATRASADO
                        </span>
                      )}
                  </div>
                  <h4 className="text-2xl font-black text-slate-800">
                    {t.descripcion_producto}
                  </h4>
                  <p className="text-lg text-slate-500 font-medium">
                    Cliente: {t.nombre_completo}
                  </p>
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-slate-600 italic">
                      "{t.descripcion_reparacion}"
                    </p>
                  </div>
                </div>

                <div className="flex flex-col justify-between items-end gap-4 min-w-50">
                  <div className="text-right">
                    <p className="text-3xl font-black text-slate-800">
                      ${parseFloat(t.precio).toFixed(2)}
                    </p>
                    <p className="text-red-500 font-bold">
                      Saldo: ${(t.precio - t.abono).toFixed(2)}
                    </p>
                    <div className="flex items-center justify-end gap-2 text-slate-400 mt-2">
                      <Calendar size={18} />
                      <span className="font-medium text-sm">
                        Entrega:{" "}
                        {t.fecha_entrega_prometida
                          ? new Date(
                              t.fecha_entrega_prometida,
                            ).toLocaleDateString()
                          : "Sin fecha"}
                      </span>
                    </div>
                  </div>

                  <div className="w-full">
                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase text-right">
                      Cambiar estado:
                    </p>
                    <div className="flex gap-1 justify-end">
                      {["Pendiente", "En Proceso", "Listo", "Entregado"].map(
                        (est) => (
                          <button
                            key={est}
                            onClick={() => cambiarEstado(t.id_trabajo, est)}
                            title={est}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${t.estado === est ? "bg-taller-600 text-white scale-110 shadow-md" : "bg-slate-200 text-slate-400 hover:bg-slate-300"}`}
                          >
                            {est === "Listo" ? (
                              <CheckCircle2 size={16} />
                            ) : est === "En Proceso" ? (
                              <Wrench size={16} />
                            ) : est === "Entregado" ? (
                              <ChevronRight size={16} />
                            ) : (
                              <Clock size={16} />
                            )}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trabajos;
