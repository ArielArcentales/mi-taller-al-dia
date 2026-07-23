import { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import {
  Clock,
  PlayCircle,
  CheckCircle,
  Package,
  Search,
  X,
  Users,
  AlertCircle,
  AlertTriangle,
  CheckSquare,
  DollarSign,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

import FormularioTrabajo from "../components/trabajos/FormularioTrabajo";
import ModalDetalleTrabajo from "../components/trabajos/ModalDetalleTrabajo";

const Trabajos = () => {
  const [clientes, setClientes] = useState([]);
  const [trabajos, setTrabajos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [busquedaTrabajos, setBusquedaTrabajos] = useState("");
  const [busquedaClientes, setBusquedaClientes] = useState("");

  const [idEdicion, setIdEdicion] = useState(null);
  const [trabajoAEliminar, setTrabajoAEliminar] = useState(null);
  const [trabajoAEntregar, setTrabajoAEntregar] = useState(null);
  const [trabajoDetalle, setTrabajoDetalle] = useState(null);
  const [metodoPagoFinal, setMetodoPagoFinal] = useState("Efectivo");

  const [formulario, setFormulario] = useState({
    id_cliente: "",
    articulos: [{ id_temp: 1, producto: "", reparacion: "", precio: "" }],
    abono: "",
    fecha_entrega_prometida: "",
  });

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const obtenerDatos = async () => {
    try {
      const res = await axiosClient.get(`/trabajos`);
      setTrabajos(res.data || []);
    } catch (error) {
      console.error("Error al obtener trabajos:", error);
    }
  };
  useEffect(() => {
    const inicializarPantalla = async () => {
      try {
        const resClientes = await axiosClient.get("/clientes");
        setClientes(resClientes.data || []);
        await obtenerDatos();
      } catch (error) {
        console.error("Error inicializando:", error);
      }
    };
    inicializarPantalla();
  }, []);

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axiosClient.put(`/trabajos/${id}/estado`, { estado: nuevoEstado });
      if (trabajoDetalle && trabajoDetalle.id_trabajo === id) {
        setTrabajoDetalle({ ...trabajoDetalle, estado: nuevoEstado });
      }
      obtenerDatos();
    } catch (error) {
      console.error(error);
    }
  };

  const ejecutarEntrega = async () => {
    if (!trabajoAEntregar) return;
    try {
      const payloadNota = {
        id_trabajo: trabajoAEntregar.id_trabajo,
        subtotal: parseFloat(trabajoAEntregar.precio),
        iva: 0,
        total: parseFloat(trabajoAEntregar.precio),
        metodo_pago: metodoPagoFinal,
        detalles_adicionales:
          "Cobro generado desde la pantalla de Órdenes de Trabajo",
      };

      await axiosClient.post("/notas-venta", payloadNota);

      obtenerDatos();
      setTrabajoAEntregar(null);
      setMetodoPagoFinal("Efectivo");
    } catch (error) {
      alert(error.response?.data?.mensaje || "Error al procesar la entrega.");
    }
  };

  const ejecutarEliminacion = async () => {
    try {
      await axiosClient.delete(`/trabajos/${trabajoAEliminar.id_trabajo}`);
      obtenerDatos();
      setTrabajoAEliminar(null);
    } catch (error) {
      console.error(error);
    }
  };

  const iniciarEdicion = (trabajo) => {
    setIdEdicion(trabajo.id_trabajo);
    setFormulario({
      id_cliente: trabajo.id_cliente,
      articulos: trabajo.articulos,
      abono: trabajo.abono,
      fecha_entrega_prometida: trabajo.fecha_entrega_prometida
        ? trabajo.fecha_entrega_prometida.split("T")[0]
        : "",
    });
    setMensaje({ texto: "", tipo: "" });
  };

  const cancelarEdicion = () => {
    setIdEdicion(null);
    setFormulario({
      id_cliente: "",
      articulos: [{ id_temp: 1, producto: "", reparacion: "", precio: "" }],
      abono: "",
      fecha_entrega_prometida: "",
    });
    setMensaje({ texto: "", tipo: "" });
  };

  const guardarTrabajo = async (e) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    const articulosValidos = formulario.articulos.every(
      (art) =>
        art.producto.trim() && art.reparacion.trim() && art.precio !== "",
    );
    if (!formulario.id_cliente || !articulosValidos) {
      setMensaje({
        texto:
          "Por favor, completa cliente y todos los datos de los artículos.",
        tipo: "error",
      });
      return;
    }

    setGuardando(true);
    try {
      const payload = {
        ...formulario,
        abono: formulario.abono ? parseFloat(formulario.abono) : 0,
      };

      if (idEdicion) {
        await axiosClient.put(`/trabajos/${idEdicion}`, payload);
        setMensaje({ texto: "¡Orden actualizada!", tipo: "exito" });
      } else {
        await axiosClient.post("/trabajos", payload);
        setMensaje({ texto: "¡Orden creada!", tipo: "exito" });
      }
      cancelarEdicion();
      obtenerDatos();
    } catch (error) {
      setMensaje({
        texto: error.response?.data?.mensaje || "Error al guardar",
        tipo: "error",
      });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000);
    }
  };

  const esAtrasado = (fecha, estado) => {
    if (!fecha || estado === "Entregado") return false;
    return (
      new Date(fecha + "T00:00:00") < new Date(new Date().setHours(0, 0, 0, 0))
    );
  };

  const trabajosActivos = trabajos.filter((t) => t.estado !== "Anulado");

  const trabajosFiltrados = trabajosActivos.filter((t) => {
    const cumpleEstado = filtroEstado === "" || t.estado === filtroEstado;
    const termino = busquedaTrabajos.toLowerCase();
    const cumpleBusqueda =
      t.nombre_completo?.toLowerCase().includes(termino) ||
      t.id_trabajo?.toString().includes(termino) ||
      t.descripcion_producto?.toLowerCase().includes(termino);
    return cumpleEstado && cumpleBusqueda;
  });

  const getEstadoStyles = (estado) => {
    switch (estado) {
      case "Pendiente":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "En Proceso":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Listo":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Entregado":
        return "bg-slate-50 text-slate-500 border-slate-200";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  const conteoEstados = {
    Pendiente: trabajosActivos.filter((t) => t.estado === "Pendiente").length,
    "En Proceso": trabajosActivos.filter((t) => t.estado === "En Proceso")
      .length,
    Listo: trabajosActivos.filter((t) => t.estado === "Listo").length,
    Entregado: trabajosActivos.filter((t) => t.estado === "Entregado").length,
  };

  return (
    <>
      {trabajoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                ¿Anular Orden?
              </h3>
            </div>
            <p className="text-lg text-slate-600 mb-8 font-medium">
              Vas a anular la orden{" "}
              <span className="font-black text-slate-800">
                #{trabajoAEliminar.id_trabajo}
              </span>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setTrabajoAEliminar(null)}
                className="flex-1 py-3 text-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminacion}
                className="flex-1 py-3 text-lg font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-colors shadow-lg shadow-red-600/30"
              >
                Sí, anular
              </button>
            </div>
          </div>
        </div>
      )}

      {trabajoAEntregar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-5">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                <CheckSquare size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                Confirmar Entrega
              </h3>
            </div>
            <p className="text-lg text-slate-600 mb-5 font-medium">
              Se registrará la salida del encargo{" "}
              <span className="font-black text-slate-800">
                #{trabajoAEntregar.id_trabajo}
              </span>
              .
            </p>
            {parseFloat(trabajoAEntregar.precio) -
              parseFloat(trabajoAEntregar.abono) >
              0 && (
              <div className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl mb-6 text-amber-700 text-base font-bold flex items-center gap-3">
                <DollarSign size={24} className="shrink-0" />
                <span>
                  Liquidación saldo: $
                  {(
                    parseFloat(trabajoAEntregar.precio) -
                    parseFloat(trabajoAEntregar.abono)
                  ).toFixed(2)}
                </span>
              </div>
            )}
            <div className="mb-8 text-left">
              <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">
                Método de Pago Final:
              </label>
              <div className="relative">
                <select
                  value={metodoPagoFinal}
                  onChange={(e) => setMetodoPagoFinal(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-lg font-bold rounded-2xl pl-4 pr-10 py-3 outline-none focus:border-taller-500 focus:ring-4 focus:ring-taller-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="Efectivo">💵 Efectivo</option>
                  <option value="Transferencia">💳 Transferencia</option>
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  size={20}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setTrabajoAEntregar(null)}
                className="flex-1 py-3 text-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEntrega}
                className="flex-1 py-3 text-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl transition-colors shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} /> Entregar
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalDetalleTrabajo
        trabajoDetalle={trabajoDetalle}
        setTrabajoDetalle={setTrabajoDetalle}
        cambiarEstado={cambiarEstado}
        iniciarEdicion={iniciarEdicion}
        iniciarAnulacion={(t) => setTrabajoAEliminar(t)}
        setTrabajoAEntregar={setTrabajoAEntregar}
        esAtrasado={esAtrasado}
      />

      <div className="flex flex-col gap-6 h-[calc(100vh-80px)] min-h-150 w-full relative z-0 pb-6">
        <div className="shrink-0 pt-2">
          <h2 className="text-4xl font-black text-slate-800">
            Órdenes de Trabajo
          </h2>
          <p className="text-xl text-slate-600 mt-2">
            Registra, filtra y gestiona los encargos del taller
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 items-start">
          <FormularioTrabajo
            formulario={formulario}
            setFormulario={setFormulario}
            clientes={clientes}
            busquedaClientes={busquedaClientes}
            setBusquedaClientes={setBusquedaClientes}
            idEdicion={idEdicion}
            guardando={guardando}
            mensaje={mensaje}
            onGuardar={guardarTrabajo}
            onCancelar={cancelarEdicion}
          />

          <div className="xl:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-white p-3 md:p-4 rounded-[2.5rem] shadow-sm border-2 border-slate-100 shrink-0">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setFiltroEstado("Pendiente");
                    obtenerDatos("Pendiente");
                  }}
                  className={`px-4 py-2.5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 group ${filtroEstado === "Pendiente" ? "bg-amber-500 border-amber-600 shadow-md scale-[1.02]" : "bg-amber-50 border-amber-100 hover:border-amber-300 hover:bg-amber-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg transition-colors ${filtroEstado === "Pendiente" ? "bg-amber-400 text-white" : "bg-amber-200 text-amber-700"}`}
                    >
                      <Clock size={18} />
                    </div>
                    <span
                      className={`text-xs uppercase tracking-wider font-bold hidden sm:block ${filtroEstado === "Pendiente" ? "text-amber-100" : "text-amber-700"}`}
                    >
                      Pendientes
                    </span>
                  </div>
                  <span
                    className={`text-2xl font-black leading-none ${filtroEstado === "Pendiente" ? "text-white" : "text-amber-900"}`}
                  >
                    {conteoEstados.Pendiente}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setFiltroEstado("En Proceso");
                    obtenerDatos("En Proceso");
                  }}
                  className={`px-4 py-2.5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 group ${filtroEstado === "En Proceso" ? "bg-blue-500 border-blue-600 shadow-md scale-[1.02]" : "bg-blue-50 border-blue-100 hover:border-blue-300 hover:bg-blue-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg transition-colors ${filtroEstado === "En Proceso" ? "bg-blue-400 text-white" : "bg-blue-200 text-blue-700"}`}
                    >
                      <PlayCircle size={18} />
                    </div>
                    <span
                      className={`text-xs uppercase tracking-wider font-bold hidden sm:block ${filtroEstado === "En Proceso" ? "text-blue-100" : "text-blue-700"}`}
                    >
                      En Proceso
                    </span>
                  </div>
                  <span
                    className={`text-2xl font-black leading-none ${filtroEstado === "En Proceso" ? "text-white" : "text-blue-900"}`}
                  >
                    {conteoEstados["En Proceso"]}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setFiltroEstado("Listo");
                    obtenerDatos("Listo");
                  }}
                  className={`px-4 py-2.5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 group ${filtroEstado === "Listo" ? "bg-emerald-500 border-emerald-600 shadow-md scale-[1.02]" : "bg-emerald-50 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg transition-colors ${filtroEstado === "Listo" ? "bg-emerald-400 text-white" : "bg-emerald-200 text-emerald-700"}`}
                    >
                      <CheckCircle size={18} />
                    </div>
                    <span
                      className={`text-xs uppercase tracking-wider font-bold hidden sm:block ${filtroEstado === "Listo" ? "text-emerald-100" : "text-emerald-700"}`}
                    >
                      Listos
                    </span>
                  </div>
                  <span
                    className={`text-2xl font-black leading-none ${filtroEstado === "Listo" ? "text-white" : "text-emerald-900"}`}
                  >
                    {conteoEstados.Listo}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setFiltroEstado("Entregado");
                    obtenerDatos("Entregado");
                  }}
                  className={`px-4 py-2.5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 group ${filtroEstado === "Entregado" ? "bg-slate-700 border-slate-800 shadow-md scale-[1.02]" : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-1.5 rounded-lg transition-colors ${filtroEstado === "Entregado" ? "bg-slate-600 text-white" : "bg-slate-200 text-slate-600"}`}
                    >
                      <Package size={18} />
                    </div>
                    <span
                      className={`text-xs uppercase tracking-wider font-bold hidden sm:block ${filtroEstado === "Entregado" ? "text-slate-300" : "text-slate-500"}`}
                    >
                      Entregados
                    </span>
                  </div>
                  <span
                    className={`text-2xl font-black leading-none ${filtroEstado === "Entregado" ? "text-white" : "text-slate-800"}`}
                  >
                    {conteoEstados.Entregado}
                  </span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 xl:p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col flex-1 min-h-0 overflow-hidden">
              <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between gap-5 mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-black text-slate-800">
                    {filtroEstado ? `Filtro: ${filtroEstado}` : "Directorio"}
                  </h3>
                  {filtroEstado && (
                    <button
                      onClick={() => {
                        setFiltroEstado("");
                        obtenerDatos("");
                      }}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors font-bold flex items-center gap-1.5"
                    >
                      <X size={14} /> Quitar
                    </button>
                  )}
                </div>
                <div className="relative w-full md:w-72">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Buscar orden..."
                    value={busquedaTrabajos}
                    onChange={(e) => setBusquedaTrabajos(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 text-sm border-2 border-slate-200 rounded-2xl focus:border-taller-500 outline-none bg-slate-50 transition-all font-bold text-slate-700 placeholder:font-medium"
                  />
                </div>
              </header>

              <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
                {trabajosFiltrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center gap-1 min-h-75">
                    <Search size={48} className="text-slate-300 mb-2" />
                    <p className="text-xl font-black text-slate-400">
                      No hay resultados
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 pb-2">
                    {trabajosFiltrados.map((t) => {
                      const estaSiendoEditado = idEdicion === t.id_trabajo;
                      const cantArticulos = Array.isArray(t.articulos)
                        ? t.articulos.length
                        : 1;

                      return (
                        <div
                          key={t.id_trabajo}
                          onClick={() => setTrabajoDetalle(t)}
                          className={`rounded-2xl border-2 transition-all duration-200 shrink-0 cursor-pointer p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${estaSiendoEditado ? "bg-indigo-50 border-indigo-300 shadow-md" : "bg-white border-slate-100 hover:border-taller-200 hover:shadow-md"} ${t.estado === "Entregado" && "opacity-75"}`}
                        >
                          <div className="flex items-center gap-5 overflow-hidden">
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shrink-0 border-2 ${estaSiendoEditado ? "bg-indigo-100 text-indigo-800 border-indigo-200" : "bg-taller-100 text-taller-800 border-taller-200"}`}
                            >
                              {t.nombre_completo?.charAt(0).toUpperCase() ||
                                "C"}
                            </div>
                            <div className="overflow-hidden">
                              <div className="flex items-center gap-3 mb-1 flex-wrap">
                                <span
                                  className={`px-2.5 py-1 rounded-lg text-xs font-black border tracking-wide transition-colors ${getEstadoStyles(t.estado)}`}
                                >
                                  {t.estado.toUpperCase()}
                                </span>
                                <span className="text-slate-400 font-bold text-sm">
                                  #{t.id_trabajo}
                                </span>
                              </div>
                              <h4 className="text-lg font-black text-slate-800 capitalize leading-tight truncate">
                                {cantArticulos > 1
                                  ? `${cantArticulos} artículos de ${t.nombre_completo}`
                                  : t.descripcion_producto}
                              </h4>
                              <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium mt-1.5 truncate">
                                <Users size={14} className="shrink-0" />{" "}
                                <span className="truncate">
                                  {t.nombre_completo}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                            {esAtrasado(
                              t.fecha_entrega_prometida,
                              t.estado,
                            ) && (
                              <AlertCircle size={20} className="text-red-500" />
                            )}
                            <span className="text-taller-500 font-bold text-xs bg-taller-50 px-4 py-2.5 rounded-xl border border-taller-100">
                              Ver detalles
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Trabajos;
