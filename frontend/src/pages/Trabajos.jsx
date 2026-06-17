import { useState, useEffect } from "react";
import {
  Plus,
  Wrench,
  Calendar,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
  Edit,
  Trash2,
  AlertTriangle,
  Users,
  FileText,
  DollarSign,
  CheckSquare,
  Star,
  ChevronDown,
  XCircle,
  Search,
  Clock,
  PlayCircle,
  CheckCircle,
  Package,
  X,
} from "lucide-react";
import axios from "axios";

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
  const [mostrarDropdownClientes, setMostrarDropdownClientes] = useState(false);

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

  const obtenerDatos = async (estado = filtroEstado) => {
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
    const inicializarPantalla = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const resClientes = await axios.get(
          "http://localhost:3000/api/clientes",
          { headers },
        );
        setClientes(resClientes.data);
        await obtenerDatos("");
      } catch (error) {
        console.error("Error al inicializar datos:", error);
      }
    };
    inicializarPantalla();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientesConConteo = clientes
    .map((c) => ({
      ...c,
      cantidad_trabajos: trabajos.filter((t) => t.id_cliente === c.id_cliente)
        .length,
    }))
    .sort((a, b) => b.cantidad_trabajos - a.cantidad_trabajos);

  const clientesFiltrados = clientesConConteo.filter((c) =>
    c.nombre_completo?.toLowerCase().includes(busquedaClientes.toLowerCase()),
  );

  const topClientes = clientesFiltrados
    .slice(0, 3)
    .filter((c) => c.cantidad_trabajos > 0);
  const otrosClientes = clientesFiltrados.filter(
    (c) => !topClientes.includes(c),
  );
  const clienteSeleccionado = clientes.find(
    (c) => c.id_cliente === formulario.id_cliente,
  );

  const trabajosActivos = trabajos.filter((t) => t.estado !== "Anulado");
  const trabajosFiltrados = trabajosActivos.filter((t) => {
    const termino = busquedaTrabajos.toLowerCase();
    return (
      t.nombre_completo?.toLowerCase().includes(termino) ||
      t.descripcion_producto?.toLowerCase().includes(termino) ||
      t.id_trabajo?.toString().includes(termino)
    );
  });

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/trabajos/${id}/estado`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (trabajoDetalle && trabajoDetalle.id_trabajo === id) {
        setTrabajoDetalle({ ...trabajoDetalle, estado: nuevoEstado });
      }

      obtenerDatos(filtroEstado);
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const ejecutarEntrega = async () => {
    if (!trabajoAEntregar) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.put(
        `http://localhost:3000/api/trabajos/${trabajoAEntregar.id_trabajo}`,
        { ...trabajoAEntregar, abono: trabajoAEntregar.precio },
        { headers },
      );

      await axios.put(
        `http://localhost:3000/api/trabajos/${trabajoAEntregar.id_trabajo}/estado`,
        { estado: "Entregado" },
        { headers },
      );

      obtenerDatos(filtroEstado);
      setTrabajoAEntregar(null);
    } catch (error) {
      console.error("Error al procesar la entrega:", error);
    }
  };

  const ejecutarEliminacion = async () => {
    if (!trabajoAEliminar) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/trabajos/${trabajoAEliminar.id_trabajo}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      obtenerDatos(filtroEstado);
      setTrabajoAEliminar(null);
    } catch (error) {
      console.error("Error al anular orden:", error);
    }
  };

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
    setMensaje({ texto: "", tipo: "" });
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

  const manejarCambioFormulario = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
    if (mensaje.tipo === "error") setMensaje({ texto: "", tipo: "" });
  };

  const guardarTrabajo = async (e) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    if (
      !formulario.id_cliente ||
      !formulario.descripcion_producto.trim() ||
      !formulario.descripcion_reparacion.trim() ||
      !formulario.precio
    ) {
      setMensaje({
        texto: "Por favor, completa los campos requeridos.",
        tipo: "error",
      });
      return;
    }

    setGuardando(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const payload = {
        ...formulario,
        precio: parseFloat(formulario.precio),
        abono: formulario.abono ? parseFloat(formulario.abono) : 0,
      };

      if (idEdicion) {
        await axios.put(
          `http://localhost:3000/api/trabajos/${idEdicion}`,
          payload,
          { headers },
        );
        setMensaje({ texto: "¡Orden actualizada!", tipo: "exito" });
      } else {
        await axios.post("http://localhost:3000/api/trabajos", payload, {
          headers,
        });
        setMensaje({ texto: "¡Orden creada!", tipo: "exito" });
      }

      cancelarEdicion();
      setFiltroEstado("");
      setBusquedaTrabajos("");
      obtenerDatos("");
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

  const esAtrasado = (fecha, estado) => {
    if (!fecha || estado === "Entregado") return false;
    return (
      new Date(fecha) < new Date() &&
      new Date(fecha).toLocaleDateString() !== new Date().toLocaleDateString()
    );
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
      {/* MODAL: ANULAR ORDEN */}
      {trabajoAEliminar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
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
                className="flex-1 py-3 text-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEliminacion}
                className="flex-1 py-3 text-lg font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-md"
              >
                Sí, anular
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ENTREGA */}
      {trabajoAEntregar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
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
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-8 text-blue-700 text-md font-bold flex items-center gap-3">
                <DollarSign size={24} />
                <span>
                  Liquidación saldo: $
                  {(
                    parseFloat(trabajoAEntregar.precio) -
                    parseFloat(trabajoAEntregar.abono)
                  ).toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setTrabajoAEntregar(null)}
                className="flex-1 py-3 text-lg font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarEntrega}
                className="flex-1 py-3 text-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-md"
              >
                Entregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRINCIPAL: DETALLES DE LA ORDEN */}
      {trabajoDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-4xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black bg-taller-100 text-taller-800 border-2 border-taller-200 shrink-0">
                  {trabajoDetalle.nombre_completo?.charAt(0).toUpperCase() ||
                    "C"}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-slate-500 font-bold">
                      Orden #{trabajoDetalle.id_trabajo}
                    </span>
                    {esAtrasado(
                      trabajoDetalle.fecha_entrega_prometida,
                      trabajoDetalle.estado,
                    ) && (
                      <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-black uppercase tracking-wide">
                        <AlertCircle size={14} /> Atrasado
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 capitalize leading-tight">
                    {trabajoDetalle.descripcion_producto}
                  </h3>
                  <p className="text-md text-slate-500 flex items-center gap-1.5 font-medium mt-1">
                    <Users size={16} /> {trabajoDetalle.nombre_completo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTrabajoDetalle(null)}
                className="p-3 bg-white hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors border border-slate-200 shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="font-bold text-slate-600 text-lg">
                  Estado Actual de la Orden:
                </span>
                <select
                  value={trabajoDetalle.estado}
                  onChange={(e) =>
                    cambiarEstado(trabajoDetalle.id_trabajo, e.target.value)
                  }
                  disabled={trabajoDetalle.estado === "Entregado"}
                  className="w-full sm:w-auto border-2 border-slate-200 rounded-xl px-5 py-2.5 font-bold text-slate-800 outline-none focus:border-taller-500 disabled:opacity-50 text-lg bg-white shadow-sm"
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Listo">Listo</option>
                  <option value="Entregado">Entregado</option>
                </select>
              </div>

              {trabajoDetalle.descripcion_reparacion && (
                <div>
                  <h4 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                    <Wrench size={20} className="text-taller-500" /> Detalle de
                    la Reparación
                  </h4>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-slate-600 text-lg font-medium leading-relaxed">
                      {trabajoDetalle.descripcion_reparacion}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-500 font-bold text-md">
                      Costo Total:
                    </span>
                    <p className="text-3xl font-black text-slate-800 leading-none">
                      ${parseFloat(trabajoDetalle.precio).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-slate-500 font-bold text-sm">
                      Estado del Pago:
                    </span>
                    {trabajoDetalle.estado === "Entregado" ||
                    parseFloat(trabajoDetalle.precio) -
                      parseFloat(trabajoDetalle.abono) ===
                      0 ? (
                      <span className="text-sm text-emerald-600 font-black border border-emerald-200 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-wide">
                        Pagado
                      </span>
                    ) : (
                      <span className="text-lg text-red-500 font-bold bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                        Saldo: -$
                        {(trabajoDetalle.precio - trabajoDetalle.abono).toFixed(
                          2,
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
                  <h4 className="font-bold text-slate-500 text-md mb-3 flex items-center gap-2">
                    <Calendar size={18} /> Fecha de Entrega
                  </h4>
                  {trabajoDetalle.fecha_entrega_prometida ? (
                    <p className="text-2xl font-black text-slate-800">
                      {new Date(
                        trabajoDetalle.fecha_entrega_prometida,
                      ).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  ) : (
                    <p className="text-lg text-slate-400 italic">
                      No se especificó fecha
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-white shrink-0 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={() => {
                  iniciarEdicion(trabajoDetalle);
                  setTrabajoDetalle(null);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-lg transition-colors border border-blue-200"
              >
                <Edit size={20} /> Editar Orden
              </button>
              <button
                onClick={() => {
                  iniciarAnulacion(trabajoDetalle);
                  setTrabajoDetalle(null);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-xl text-lg transition-colors border border-red-200"
              >
                <Trash2 size={20} /> Anular Orden
              </button>
              <button
                disabled={trabajoDetalle.estado === "Entregado"}
                onClick={() => {
                  setTrabajoAEntregar(trabajoDetalle);
                  setTrabajoDetalle(null);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl text-lg transition-colors disabled:opacity-30 shadow-lg"
              >
                <CheckSquare size={20} /> Cobrar y Entregar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex flex-col gap-6 h-[calc(100vh-80px)] min-h-[500px] w-full relative z-0 pb-6">
        {/* Cabecera Principal - Fija */}
        <div className="shrink-0 pt-2">
          <h2 className="text-4xl font-black text-slate-800">
            Órdenes de Trabajo
          </h2>
          <p className="text-lg text-slate-600 mt-2">
            Registra, filtra y gestiona los encargos del taller
          </p>
        </div>

        {/* GRID DE DISEÑO */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-1 min-h-0 items-start">
          {/* ================= COLUMNA IZQUIERDA: FORMULARIO ESTÁTICO SIN SCROLL ================= */}
          <div className="xl:col-span-4 bg-white p-6 xl:p-8 rounded-4xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
            <header className="shrink-0 flex items-center gap-4 mb-5">
              <div
                className={`p-3 rounded-2xl ${idEdicion ? "bg-blue-100 text-blue-700" : "bg-taller-100 text-taller-700"}`}
              >
                {idEdicion ? <Edit size={24} /> : <Plus size={24} />}
              </div>
              <h3 className="text-2xl font-black text-slate-800">
                {idEdicion ? "Editar Orden" : "Nuevo Ingreso"}
              </h3>
            </header>

            {mensaje.texto && (
              <div
                className={`shrink-0 mb-5 flex items-center gap-3 border-2 p-3.5 rounded-xl transition-all animate-in fade-in slide-in-from-top-2 
                ${mensaje.tipo === "exito" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
              >
                {mensaje.tipo === "exito" ? (
                  <CheckCircle2 className="shrink-0" size={20} />
                ) : (
                  <AlertCircle className="shrink-0" size={20} />
                )}
                <p className="text-sm font-bold">{mensaje.texto}</p>
              </div>
            )}

            {/* FORMULARIO ESTÁTICO: Flexbox se encarga de estirar el textarea */}
            <form
              onSubmit={guardarTrabajo}
              className="flex-1 flex flex-col min-h-0 justify-between"
            >
              <div className="flex flex-col gap-3 xl:gap-4">
                {/* Cliente */}
                <div className="shrink-0">
                  <label className="block text-slate-800 font-bold text-sm mb-2 ml-1">
                    Cliente
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarDropdownClientes(!mostrarDropdownClientes);
                        if (!mostrarDropdownClientes) setBusquedaClientes("");
                      }}
                      className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl outline-none text-left font-bold bg-slate-50 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-3 truncate">
                        <Users className="text-slate-400 shrink-0" size={20} />
                        <span className="truncate">
                          {clienteSeleccionado
                            ? clienteSeleccionado.nombre_completo
                            : "Seleccionar"}
                        </span>
                      </span>
                      <ChevronDown
                        size={20}
                        className="text-slate-400 shrink-0"
                      />
                    </button>

                    {mostrarDropdownClientes && (
                      <div className="absolute left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-30 flex flex-col max-h-72 overflow-hidden">
                        <div className="p-3 border-b border-slate-100 bg-slate-50 shrink-0">
                          <div className="relative">
                            <Search
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                              size={18}
                            />
                            <input
                              type="text"
                              placeholder="Buscar cliente..."
                              value={busquedaClientes}
                              onChange={(e) =>
                                setBusquedaClientes(e.target.value)
                              }
                              className="w-full pl-11 pr-4 py-2 text-md border border-slate-200 rounded-xl outline-none focus:border-taller-500 font-medium"
                              autoFocus
                            />
                          </div>
                        </div>

                        <div className="overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
                          {clientesFiltrados.length === 0 ? (
                            <p className="text-center text-slate-500 py-3 text-sm font-medium">
                              No se encontraron clientes.
                            </p>
                          ) : (
                            <>
                              {topClientes.length > 0 && !busquedaClientes && (
                                <div>
                                  <p className="text-xs font-black text-amber-600 uppercase tracking-wider mb-2 ml-2 flex items-center gap-1.5">
                                    <Star
                                      size={14}
                                      className="fill-amber-500 text-amber-500"
                                    />{" "}
                                    Frecuentes
                                  </p>
                                  {topClientes.map((c) => (
                                    <button
                                      key={`top-${c.id_cliente}`}
                                      type="button"
                                      onClick={() => {
                                        setFormulario({
                                          ...formulario,
                                          id_cliente: c.id_cliente,
                                        });
                                        setMostrarDropdownClientes(false);
                                      }}
                                      className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
                                    >
                                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm shrink-0">
                                        {c.nombre_completo
                                          .charAt(0)
                                          .toUpperCase()}
                                      </div>
                                      <span className="text-md font-bold text-slate-800 truncate">
                                        {c.nombre_completo}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                              <div className="mt-3">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 ml-2">
                                  Directorio
                                </p>
                                {otrosClientes.map((c) => (
                                  <button
                                    key={`all-${c.id_cliente}`}
                                    type="button"
                                    onClick={() => {
                                      setFormulario({
                                        ...formulario,
                                        id_cliente: c.id_cliente,
                                      });
                                      setMostrarDropdownClientes(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-taller-100 text-taller-800 flex items-center justify-center font-black text-sm shrink-0">
                                      {c.nombre_completo
                                        .charAt(0)
                                        .toUpperCase()}
                                    </div>
                                    <span className="text-md font-bold text-slate-800 truncate">
                                      {c.nombre_completo}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Artículo */}
                <div className="shrink-0">
                  <label className="block text-slate-800 font-bold text-sm mb-2 ml-1">
                    Artículo
                  </label>
                  <div className="relative group">
                    <FileText
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-500 transition-colors"
                      size={20}
                    />
                    <input
                      type="text"
                      name="descripcion_producto"
                      value={formulario.descripcion_producto}
                      onChange={manejarCambioFormulario}
                      placeholder="Ej: Botas negras"
                      className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-taller-800 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-slate-800 font-bold bg-slate-50"
                    />
                  </div>
                </div>

                {/* Detalle de Reparación (Este elemento se estira gracias a flex-1) */}
                <div className="flex flex-col flex-1 min-h-[60px]">
                  <label className="shrink-0 block text-slate-800 font-bold text-sm mb-2 ml-1">
                    Detalle de Reparación
                  </label>
                  <div className="relative group flex-1 flex flex-col">
                    <Wrench
                      className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-taller-500 transition-colors z-10"
                      size={20}
                    />
                    <textarea
                      name="descripcion_reparacion"
                      value={formulario.descripcion_reparacion}
                      onChange={manejarCambioFormulario}
                      placeholder="Ej: Cambio de suelas, limpieza..."
                      className="flex-1 w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-taller-800 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-slate-800 font-medium bg-slate-50 resize-none"
                    ></textarea>
                  </div>
                </div>

                {/* Finanzas */}
                <div className="shrink-0 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-800 font-bold text-sm mb-2 ml-1">
                      Total
                    </label>
                    <div className="relative group">
                      <DollarSign
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                      />
                      <input
                        type="number"
                        name="precio"
                        step="0.01"
                        placeholder="0.00"
                        value={formulario.precio}
                        onChange={manejarCambioFormulario}
                        className="w-full pl-10 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-taller-800 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-slate-800 font-bold bg-slate-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-slate-800 font-bold text-sm mb-2 ml-1">
                      Abono
                    </label>
                    <div className="relative group">
                      <DollarSign
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={20}
                      />
                      <input
                        type="number"
                        name="abono"
                        step="0.01"
                        placeholder="0.00"
                        value={formulario.abono}
                        onChange={manejarCambioFormulario}
                        className="w-full pl-10 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-taller-800 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-slate-800 font-bold bg-slate-50"
                      />
                    </div>
                  </div>
                </div>

                {/* Fecha */}
                <div className="shrink-0">
                  <label className="block text-slate-800 font-bold text-sm mb-2 ml-1">
                    Fecha Entrega
                  </label>
                  <div className="relative group">
                    <Calendar
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={20}
                    />
                    <input
                      type="date"
                      name="fecha_entrega_prometida"
                      value={formulario.fecha_entrega_prometida}
                      onChange={manejarCambioFormulario}
                      className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-xl focus:border-taller-800 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-slate-800 font-bold bg-slate-50"
                    />
                  </div>
                </div>
              </div>

              {/* Botón Fijo Abajo (mt-auto lo empuja siempre al final) */}
              <div className="shrink-0 pt-4 mt-auto border-t border-slate-100 bg-white">
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={guardando}
                    className={`w-full flex items-center justify-center gap-3 text-white text-xl font-black py-4 rounded-2xl transition-all disabled:opacity-70 shadow-md
                      ${idEdicion ? "bg-blue-600 hover:bg-blue-700" : "bg-taller-950 hover:bg-taller-800"}`}
                  >
                    {guardando ? (
                      <>
                        <Loader2 className="animate-spin" size={24} />
                        <span>Guardando</span>
                      </>
                    ) : (
                      <>
                        <Save size={24} />
                        <span>
                          {idEdicion ? "Actualizar Orden" : "Registrar Trabajo"}
                        </span>
                      </>
                    )}
                  </button>

                  {idEdicion && (
                    <button
                      type="button"
                      onClick={cancelarEdicion}
                      className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-md font-bold py-2.5 rounded-2xl transition-all"
                    >
                      <XCircle size={20} />
                      <span>Cancelar Edición</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* ================= COLUMNA DERECHA: ESTADOS Y DIRECTORIO (8/12) ================= */}
          <div className="xl:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
            {/* RECUADRO 2: RESUMEN DE ESTADOS ULTRA-COMPACTO HORIZONTAL */}
            <div className="bg-white p-3 md:p-4 rounded-3xl shadow-sm border border-slate-200 shrink-0">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setFiltroEstado("Pendiente");
                    obtenerDatos("Pendiente");
                  }}
                  className={`px-4 py-2.5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 group
                    ${filtroEstado === "Pendiente" ? "bg-amber-500 border-amber-600 shadow-md scale-[1.02]" : "bg-amber-50 border-amber-100 hover:border-amber-300 hover:bg-amber-100"}`}
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
                  className={`px-4 py-2.5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 group
                    ${filtroEstado === "En Proceso" ? "bg-blue-500 border-blue-600 shadow-md scale-[1.02]" : "bg-blue-50 border-blue-100 hover:border-blue-300 hover:bg-blue-100"}`}
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
                  className={`px-4 py-2.5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 group
                    ${filtroEstado === "Listo" ? "bg-emerald-500 border-emerald-600 shadow-md scale-[1.02]" : "bg-emerald-50 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100"}`}
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
                  className={`px-4 py-2.5 rounded-2xl border-2 flex items-center justify-between transition-all duration-200 group
                    ${filtroEstado === "Entregado" ? "bg-slate-700 border-slate-800 shadow-md scale-[1.02]" : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100"}`}
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

            {/* RECUADRO 3: DIRECTORIO DE TRABAJOS (ALTO Y LIMPIO) */}
            <div className="bg-white p-6 xl:p-8 rounded-4xl shadow-sm border border-slate-200 flex flex-col flex-1 min-h-0 overflow-hidden">
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
                    className="w-full pl-12 pr-4 py-3 text-md border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none bg-slate-50 transition-all font-bold text-slate-700 placeholder:font-medium"
                  />
                </div>
              </header>

              <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
                {trabajosFiltrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center min-h-[300px]">
                    <div className="p-4 bg-slate-100 rounded-full mb-4">
                      <Wrench size={40} className="text-slate-300" />
                    </div>
                    <p className="text-2xl font-black text-slate-500 mb-1">
                      No hay resultados
                    </p>
                    <p className="text-md font-medium">
                      No se encontraron trabajos con esos criterios.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {trabajosFiltrados.map((t) => {
                      const estaSiendoEditado = idEdicion === t.id_trabajo;

                      return (
                        <div
                          key={t.id_trabajo}
                          onClick={() => setTrabajoDetalle(t)}
                          className={`rounded-3xl border-2 transition-all duration-200 shrink-0 cursor-pointer p-5 flex flex-col md:flex-row md:items-center justify-between gap-4
                            ${estaSiendoEditado ? "bg-blue-50 border-blue-300 shadow-md" : "bg-white border-slate-100 hover:border-taller-200 hover:shadow-md"}
                            ${t.estado === "Entregado" && "opacity-75"}`}
                        >
                          <div className="flex items-center gap-5 overflow-hidden">
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-black shrink-0 border-2
                              ${estaSiendoEditado ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-taller-100 text-taller-800 border-taller-200"}`}
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
                              <h4 className="text-xl font-black text-slate-800 capitalize leading-tight truncate">
                                {t.descripcion_producto}
                              </h4>
                              <p className="text-md text-slate-500 flex items-center gap-1.5 font-medium mt-1 truncate">
                                <Users size={16} className="shrink-0" />{" "}
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
                            <span className="text-taller-500 font-bold text-sm bg-taller-50 px-4 py-2 rounded-xl border border-taller-100 hover:bg-taller-100 transition-colors">
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
