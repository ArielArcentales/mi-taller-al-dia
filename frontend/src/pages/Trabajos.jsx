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
  Edit2,
  Trash2,
  X,
} from "lucide-react";
import axios from "axios";

const Trabajos = () => {
  const [clientes, setClientes] = useState([]);
  const [trabajos, setTrabajos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");

  const [idEdicion, setIdEdicion] = useState(null);

  const [formulario, setFormulario] = useState({
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
      console.error(error);
      alert("No se pudo actualizar el estado");
    }
  };

  //Eliminar Trabajo
  const eliminarTrabajo = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de que deseas anular esta orden de trabajo? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/api/trabajos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrabajos(trabajos.filter((t) => t.id_trabajo !== id));
    } catch (error) {
      alert(error.response?.data?.mensaje || "Error al eliminar la orden");
    }
  };

  // HU-24: Preparar el formulario para edición
  const iniciarEdicion = (trabajo) => {
    setIdEdicion(trabajo.id_trabajo);
    setFormulario({
      id_cliente: trabajo.id_cliente,
      descripcion_producto: trabajo.descripcion_producto,
      descripcion_reparacion: trabajo.descripcion_reparacion,
      precio: trabajo.precio,
      abono: trabajo.abono,

      fecha_entrega_prometida: trabajo.fecha_entrega_prometida
        ? trabajo.fecha_entrega_prometida.split("T")[0]
        : "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setIdEdicion(null);
    setFormulario({
      id_cliente: "",
      descripcion_producto: "",
      descripcion_reparacion: "",
      precio: "",
      abono: "",
      fecha_entrega_prometida: "",
    });
    setMensaje({ texto: "", tipo: "" });
  };

  // Esta sirve tanto para CREAR como para ACTUALIZAR
  const guardarTrabajo = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        ...formulario,
        precio: parseFloat(formulario.precio),
        abono: formulario.abono ? parseFloat(formulario.abono) : 0,
      };

      if (idEdicion) {
        // Modo Edición
        await axios.put(
          `http://localhost:3000/api/trabajos/${idEdicion}`,
          payload,
          { headers },
        );
        setMensaje({
          texto: "¡Orden actualizada correctamente!",
          tipo: "exito",
        });
      } else {
        // Modo Creación
        await axios.post("http://localhost:3000/api/trabajos", payload, {
          headers,
        });
        setMensaje({ texto: "¡Orden creada con éxito!", tipo: "exito" });
      }

      cancelarEdicion();
      obtenerDatos(filtroEstado); // Recargamos la lista
    } catch (error) {
      setMensaje({
        texto: error.response?.data?.mensaje || "Error al guardar",
        tipo: "error",
      });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
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
        {/* PANEL IZQUIERDO: FORMULARIO */}
        <div
          className={`xl:col-span-1 p-6 rounded-2xl shadow-sm border h-fit sticky top-8 transition-colors ${idEdicion ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              {idEdicion ? (
                <Edit2 className="text-blue-600" />
              ) : (
                <Plus className="text-taller-500" />
              )}
              {idEdicion ? `Editar Orden #${idEdicion}` : "Nuevo Ingreso"}
            </h3>
            {idEdicion && (
              <button
                onClick={cancelarEdicion}
                className="p-2 text-slate-500 hover:bg-blue-100 rounded-full transition-colors"
                title="Cancelar edición"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {mensaje.texto && (
            <div
              className={`p-4 rounded-xl mb-6 font-bold flex items-center gap-2 ${mensaje.tipo === "exito" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              <AlertCircle size={20} /> {mensaje.texto}
            </div>
          )}

          <form onSubmit={guardarTrabajo} className="space-y-4">
            <select
              name="id_cliente"
              required
              value={formulario.id_cliente}
              onChange={(e) =>
                setFormulario({ ...formulario, id_cliente: e.target.value })
              }
              className="w-full p-4 text-lg border-2 rounded-xl outline-none focus:border-blue-500 bg-white"
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
              value={formulario.descripcion_producto}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  descripcion_producto: e.target.value,
                })
              }
              className="w-full p-4 text-lg border-2 rounded-xl outline-none focus:border-blue-500"
            />
            <textarea
              name="descripcion_reparacion"
              required
              placeholder="Detalle de la reparación..."
              value={formulario.descripcion_reparacion}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  descripcion_reparacion: e.target.value,
                })
              }
              className="w-full p-4 text-lg border-2 rounded-xl outline-none focus:border-blue-500 resize-none h-24"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                name="precio"
                required
                step="0.01"
                placeholder="Precio $"
                value={formulario.precio}
                onChange={(e) =>
                  setFormulario({ ...formulario, precio: e.target.value })
                }
                className="w-full p-4 text-lg border-2 rounded-xl outline-none focus:border-blue-500"
              />
              <input
                type="number"
                name="abono"
                step="0.01"
                placeholder="Abono $"
                value={formulario.abono}
                onChange={(e) =>
                  setFormulario({ ...formulario, abono: e.target.value })
                }
                className="w-full p-4 text-lg border-2 rounded-xl outline-none focus:border-blue-500"
              />
            </div>
            <input
              type="date"
              name="fecha_entrega_prometida"
              value={formulario.fecha_entrega_prometida}
              onChange={(e) =>
                setFormulario({
                  ...formulario,
                  fecha_entrega_prometida: e.target.value,
                })
              }
              className="w-full p-4 text-lg border-2 rounded-xl outline-none focus:border-blue-500"
            />

            <button
              disabled={guardando}
              className={`w-full py-4 text-white rounded-xl text-xl font-bold transition-colors flex justify-center items-center gap-2 ${idEdicion ? "bg-blue-600 hover:bg-blue-700" : "bg-taller-950 hover:bg-taller-800"}`}
            >
              {guardando ? <Loader2 className="animate-spin" /> : <Save />}
              {idEdicion ? "Actualizar Orden" : "Registrar Orden"}
            </button>
          </form>
        </div>

        {/* PANEL DERECHO: LISTADO */}
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
                    <span className="text-slate-400 font-bold text-sm">
                      #{t.id_trabajo}
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
                  <div className="text-right flex flex-col items-end">
                    {/* Botones de Acción (Editar / Eliminar) */}
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => iniciarEdicion(t)}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar detalles"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => eliminarTrabajo(t.id_trabajo)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        title="Anular orden"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

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
                    <div className="flex gap-1 justify-end">
                      {["Pendiente", "En Proceso", "Listo", "Entregado"].map(
                        (est) => (
                          <button
                            key={est}
                            onClick={() => cambiarEstado(t.id_trabajo, est)}
                            title={`Mover a ${est}`}
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
