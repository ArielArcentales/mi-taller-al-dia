import { useState, useEffect } from "react";
import {
  Plus,
  Wrench,
  Calendar,
  Loader2,
  Save,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Users,
  FileText,
  DollarSign,
  CheckSquare,
  Star,
} from "lucide-react";
import axios from "axios";

const Trabajos = () => {
  // Estados para almacenar los datos de la base de datos y filtros
  const [clientes, setClientes] = useState([]);
  const [trabajos, setTrabajos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState("");

  // Estados para el control de modales y modo edición
  const [idEdicion, setIdEdicion] = useState(null);
  const [trabajoAEliminar, setTrabajoAEliminar] = useState(null);
  const [trabajoAEntregar, setTrabajoAEntregar] = useState(null);

  // NUEVO: Estado para capturar el método de pago al entregar
  const [metodoPagoFinal, setMetodoPagoFinal] = useState("Efectivo");

  // Estados para el formulario de nueva/edición de orden
  const [formulario, setFormulario] = useState({
    id_cliente: "",
    descripcion_producto: "",
    descripcion_reparacion: "",
    precio: "",
    abono: "",
    fecha_entrega_prometida: "",
  });

  // Estados de carga y notificaciones
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // Función para obtener la lista de trabajos desde el backend
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

  // Se ejecuta automáticamente al abrir la pantalla
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
        await obtenerDatos();
      } catch (error) {
        console.error("Error al inicializar datos:", error);
      }
    };
    inicializarPantalla();
  }, []);

  // Lógica para calcular los clientes frecuentes (VIP)
  const clientesConConteo = clientes
    .map((c) => ({
      ...c,
      cantidad_trabajos: trabajos.filter((t) => t.id_cliente === c.id_cliente)
        .length,
    }))
    .sort((a, b) => b.cantidad_trabajos - a.cantidad_trabajos);

  const topClientes = clientesConConteo
    .slice(0, 3)
    .filter((c) => c.cantidad_trabajos > 0);
  const otrosClientes = clientesConConteo.filter(
    (c) => !topClientes.includes(c),
  );

  // Filtro para ocultar los trabajos anulados de la vista principal
  const trabajosActivos = trabajos.filter((t) => t.estado !== "Anulado");

  // Función para actualizar el estado de una orden de trabajo (HU-23)
  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:3000/api/trabajos/${id}/estado`,
        { estado: nuevoEstado },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      obtenerDatos(filtroEstado); // Recargar la lista para aplicar ordenamiento
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      alert("No se pudo actualizar el estado");
    }
  };

  // NUEVA FUNCIÓN: Confirmar entrega e inyectar en Finanzas
  const ejecutarEntrega = async () => {
    if (!trabajoAEntregar) return;
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Preparamos los datos financieros para generar el recibo
      const payloadNota = {
        id_trabajo: trabajoAEntregar.id_trabajo,
        subtotal: parseFloat(trabajoAEntregar.precio),
        iva: 0,
        total: parseFloat(trabajoAEntregar.precio),
        metodo_pago: metodoPagoFinal,
        detalles_adicionales:
          "Cobro generado desde la pantalla de Órdenes de Trabajo",
      };

      // Disparamos la creación de la nota de venta (El backend automáticamente lo marca "Entregado")
      await axios.post("http://localhost:3000/api/notas-venta", payloadNota, {
        headers,
      });

      obtenerDatos(filtroEstado);
      setTrabajoAEntregar(null);
      setMetodoPagoFinal("Efectivo"); // Reseteamos el selector
    } catch (error) {
      console.error("Error al procesar la entrega:", error);
      alert(
        error.response?.data?.mensaje ||
          "Error al procesar la entrega y generar el cobro.",
      );
    }
  };

  // Función para anular una orden (Soft Delete) (HU-25)
  const ejecutarEliminacion = async () => {
    if (!trabajoAEliminar) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/trabajos/${trabajoAEliminar.id_trabajo}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      obtenerDatos(filtroEstado);
      setTrabajoAEliminar(null);
    } catch (error) {
      console.error("Error al anular orden:", error);
      alert("Error al anular la orden");
    }
  };

  // Manejador para preparar el formulario en modo edición (HU-24)
  const iniciarEdicion = (trabajo) => {
    setIdEdicion(trabajo.id_trabajo);
    setFormulario({
      id_cliente: trabajo.id_cliente,
      descripcion_producto: trabajo.descripcion_producto,
      descripcion_reparacion: trabajo.descripcion_reparacion,
      precio: trabajo.precio,
      abono: trabajo.abono,
      // Formatear la fecha para el input type="date"
      fecha_entrega_prometida: trabajo.fecha_entrega_prometida
        ? trabajo.fecha_entrega_prometida.split("T")[0]
        : "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll automático hacia arriba
  };

  // Manejador para salir del modo edición y limpiar el formulario
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

  // Manejador de los inputs del formulario
  const manejarCambioFormulario = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  // Función para registrar o actualizar una orden de trabajo (HU-20 y HU-24)
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
        await axios.post("http://localhost:3000/api/trabajos", payload, {
          headers,
        });
        setMensaje({ texto: "¡Orden creada con éxito!", tipo: "exito" });
      }

      cancelarEdicion();
      obtenerDatos(filtroEstado); // Recargar la lista para ver los cambios
    } catch (error) {
      setMensaje({
        texto: error.response?.data?.mensaje || "Error al guardar la orden",
        tipo: "error",
      });
    } finally {
      setGuardando(false);
      // Borrar el mensaje después de 4 segundos
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
    }
  };

  // Utilidad para asignar colores visuales según el estado de la orden
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

  // Utilidad para detectar si una orden está atrasada (HU-26)
  const esAtrasado = (fecha, estado) => {
    if (!fecha || estado === "Entregado") return false;
    return (
      new Date(fecha) < new Date() &&
      new Date(fecha).toLocaleDateString() !== new Date().toLocaleDateString()
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Título de la sección */}
      <div>
        <h2 className="text-4xl font-black text-slate-800">
          Órdenes de Trabajo
        </h2>
        <p className="text-xl text-slate-600 mt-2">
          Registra y gestiona los encargos del taller.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* PANEL IZQUIERDO: Formulario de Registro o Edición (HU-20, HU-24) */}
        <div
          className={`xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-8 transition-colors ${idEdicion ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${idEdicion ? "bg-blue-200 text-blue-700" : "bg-taller-100 text-taller-700"}`}
              >
                {idEdicion ? <Edit2 size={28} /> : <Plus size={28} />}
              </div>
              <h3 className="text-2xl font-bold text-slate-800">
                {idEdicion ? `Editar Orden` : "Nuevo Ingreso"}
              </h3>
            </div>
            {idEdicion && (
              <button
                onClick={cancelarEdicion}
                className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"
                title="Cancelar edición"
              >
                <X size={28} />
              </button>
            )}
          </div>

          {mensaje.texto && (
            <div
              className={`p-4 rounded-xl mb-6 text-lg font-bold flex items-center gap-2 ${mensaje.tipo === "exito" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              <AlertCircle size={24} /> {mensaje.texto}
            </div>
          )}

          <form onSubmit={guardarTrabajo} className="space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-slate-700 font-bold text-lg">
                  Cliente *
                </label>
                {topClientes.length > 0 && !idEdicion && (
                  <div className="flex gap-2">
                    {topClientes.map((c) => (
                      <button
                        key={`btn-${c.id_cliente}`}
                        type="button"
                        onClick={() =>
                          setFormulario({
                            ...formulario,
                            id_cliente: c.id_cliente,
                          })
                        }
                        className="text-xs uppercase tracking-wider font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-md flex items-center gap-1 hover:bg-amber-100 transition-colors"
                        title={`${c.cantidad_trabajos} trabajos previos`}
                      >
                        <Star size={12} className="fill-amber-500" />
                        {c.nombre_completo.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <Users
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={24}
                />
                <select
                  name="id_cliente"
                  required
                  value={formulario.id_cliente}
                  onChange={manejarCambioFormulario}
                  className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none bg-white appearance-none"
                >
                  <option value="">Seleccione un cliente...</option>

                  {topClientes.length > 0 && (
                    <optgroup label="Clientes Frecuentes">
                      {topClientes.map((c) => (
                        <option key={c.id_cliente} value={c.id_cliente}>
                          {c.nombre_completo} ({c.cantidad_trabajos} trabajos)
                        </option>
                      ))}
                    </optgroup>
                  )}

                  <optgroup label="Todos los clientes">
                    {otrosClientes.map((c) => (
                      <option key={c.id_cliente} value={c.id_cliente}>
                        {c.nombre_completo}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-lg mb-2">
                Artículo (Zapato, Bolso...) *
              </label>
              <div className="relative">
                <FileText
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={24}
                />
                <input
                  type="text"
                  name="descripcion_producto"
                  required
                  placeholder="Ej: Botas negras de cuero"
                  value={formulario.descripcion_producto}
                  onChange={manejarCambioFormulario}
                  className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-lg mb-2">
                Detalle de Reparación *
              </label>
              <div className="relative">
                <Wrench
                  className="absolute left-4 top-4 text-slate-400"
                  size={24}
                />
                <textarea
                  name="descripcion_reparacion"
                  required
                  rows="3"
                  placeholder="Ej: Cambio de suelas..."
                  value={formulario.descripcion_reparacion}
                  onChange={manejarCambioFormulario}
                  className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold text-lg mb-2">
                  Precio Total *
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={24}
                  />
                  <input
                    type="number"
                    name="precio"
                    required
                    step="0.01"
                    placeholder="0.00"
                    value={formulario.precio}
                    onChange={manejarCambioFormulario}
                    className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-bold text-lg mb-2">
                  Abono
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={24}
                  />
                  <input
                    type="number"
                    name="abono"
                    step="0.01"
                    placeholder="0.00"
                    value={formulario.abono}
                    onChange={manejarCambioFormulario}
                    className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-lg mb-2">
                Fecha de Entrega
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={24}
                />
                <input
                  type="date"
                  name="fecha_entrega_prometida"
                  value={formulario.fecha_entrega_prometida}
                  onChange={manejarCambioFormulario}
                  className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none bg-white"
                />
              </div>
            </div>

            <button
              disabled={guardando}
              className={`w-full flex items-center justify-center gap-3 text-white text-2xl font-bold py-5 rounded-xl transition-all disabled:opacity-70 ${idEdicion ? "bg-blue-600 hover:bg-blue-700" : "bg-taller-950 hover:bg-taller-800"}`}
            >
              {guardando ? (
                <Loader2 className="animate-spin" size={28} />
              ) : (
                <Save size={28} />
              )}
              {guardando
                ? "Guardando..."
                : idEdicion
                  ? "Actualizar Orden"
                  : "Registrar Trabajo"}
            </button>
          </form>
        </div>

        {/* PANEL DERECHO: Directorio y Gestión de Trabajos (HU-22) */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full .min-h-[500px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-2xl font-bold text-slate-800">
              Directorio de Trabajos
            </h3>

            {/* Filtros interactivos de estado */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 max-w-full hide-scrollbar">
              {["", "Pendiente", "En Proceso", "Listo", "Entregado"].map(
                (est) => (
                  <button
                    key={est}
                    onClick={() => {
                      setFiltroEstado(est);
                      obtenerDatos(est);
                    }}
                    className={`px-6 py-2 rounded-full text-lg font-bold whitespace-nowrap transition-all border-2 ${filtroEstado === est ? "bg-taller-950 text-white border-taller-950" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                  >
                    {est || "Todos"}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Tabla / Lista de resultados */}
          <div className="flex-1 overflow-auto">
            {trabajosActivos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                <Wrench size={64} className="mb-4 opacity-50" />
                <p className="text-2xl font-bold text-slate-500">
                  No hay trabajos activos
                </p>
                <p className="text-lg mt-2">
                  Usa el formulario de la izquierda para ingresar el primero.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {trabajosActivos.map((t) => (
                  <div
                    key={t.id_trabajo}
                    className={`p-5 border-2 rounded-xl transition-colors bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 ${t.estado === "Entregado" ? "bg-slate-50 border-slate-100 opacity-60" : "bg-slate-50 border-slate-100 hover:border-taller-200"}`}
                  >
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-lg text-sm font-black border ${getEstadoStyles(t.estado)}`}
                        >
                          {t.estado.toUpperCase()}
                        </span>
                        <span className="text-slate-400 font-bold text-sm">
                          #{t.id_trabajo}
                        </span>
                        {esAtrasado(t.fecha_entrega_prometida, t.estado) && (
                          <span className="flex items-center gap-1 text-red-600 font-bold text-xs uppercase tracking-wide bg-red-100 px-2 py-1 rounded">
                            <AlertCircle size={14} /> Atrasado
                          </span>
                        )}
                      </div>

                      <h4 className="text-2xl font-bold text-slate-800 capitalize leading-tight">
                        {t.descripcion_producto}
                      </h4>

                      <p className="text-lg text-slate-500 flex items-center gap-2 mt-1">
                        <Users size={18} /> {t.nombre_completo}
                      </p>

                      <div className="mt-3 bg-white p-3 rounded-lg border border-slate-200 text-slate-600 text-md max-w-lg">
                        <p className="line-clamp-2">
                          <strong>Detalle:</strong> {t.descripcion_reparacion}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between items-end gap-4 .min-w-[200px]">
                      <div className="text-right w-full">
                        <div className="flex items-center gap-2 justify-end mb-2">
                          <p className="text-3xl font-black text-slate-800">
                            ${parseFloat(t.precio).toFixed(2)}
                          </p>
                          {t.estado === "Entregado" ||
                          parseFloat(t.precio) - parseFloat(t.abono) === 0 ? (
                            <span className="text-sm text-emerald-600 font-black border border-emerald-200 bg-emerald-50 px-2 py-1 rounded uppercase">
                              Pagado
                            </span>
                          ) : (
                            <span className="text-md text-red-500 font-bold">
                              (-${(t.precio - t.abono).toFixed(2)})
                            </span>
                          )}
                        </div>

                        {t.fecha_entrega_prometida && (
                          <div className="flex items-center justify-end gap-2 text-slate-500 text-md">
                            <Calendar size={18} />{" "}
                            {new Date(
                              t.fecha_entrega_prometida,
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 w-full justify-end mt-2">
                        {/* Selector rápido de estado */}
                        {t.estado !== "Entregado" && (
                          <select
                            value={t.estado}
                            onChange={(e) =>
                              cambiarEstado(t.id_trabajo, e.target.value)
                            }
                            className="text-sm font-bold bg-white border-2 border-slate-200 text-slate-700 rounded-lg px-2 py-2 outline-none cursor-pointer hover:border-taller-500"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Listo">Listo</option>
                          </select>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => iniciarEdicion(t)}
                            className="p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => setTrabajoAEliminar(t)}
                            className="p-2 text-red-600 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                            title="Anular"
                          >
                            <Trash2 size={20} />
                          </button>

                          <div className="w-px bg-slate-200 mx-1"></div>

                          <button
                            disabled={t.estado === "Entregado"}
                            onClick={() => setTrabajoAEntregar(t)}
                            className="p-2 text-emerald-600 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors disabled:opacity-30 disabled:bg-transparent"
                            title="Marcar como Entregado"
                          >
                            <CheckSquare size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Confirmar Anulación (HU-25) */}
      {trabajoAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-red-50 p-8 flex flex-col items-center text-center border-b border-red-100">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-3xl font-black text-slate-800">
                ¿Anular Orden?
              </h3>
              <p className="text-slate-600 mt-3 text-lg">
                Vas a anular la orden{" "}
                <span className="font-bold">
                  #{trabajoAEliminar.id_trabajo}
                </span>{" "}
                de la lista de pendientes.
              </p>
            </div>
            <div className="p-8 bg-white">
              <p className="text-slate-500 text-center text-md mb-8">
                La orden desaparecerá de esta pantalla, pero se conservará en
                los registros de auditoría del sistema.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setTrabajoAEliminar(null)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-lg font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={ejecutarEliminacion}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={20} /> Anular
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar Entrega y Pago */}
      {trabajoAEntregar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-emerald-50 p-8 flex flex-col items-center text-center border-b border-emerald-100">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <CheckSquare size={40} />
              </div>
              <h3 className="text-3xl font-black text-slate-800">
                Confirmar Entrega
              </h3>
              <p className="text-slate-600 mt-3 text-lg">
                Se marcará la orden{" "}
                <span className="font-bold">
                  #{trabajoAEntregar.id_trabajo}
                </span>{" "}
                como entregada al cliente.
              </p>
            </div>
            <div className="p-8 bg-white">
              {parseFloat(trabajoAEntregar.precio) -
                parseFloat(trabajoAEntregar.abono) >
                0 && (
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-6 text-blue-800 text-center text-sm font-bold">
                  El sistema registrará automáticamente el pago del saldo
                  pendiente de $
                  {(
                    parseFloat(trabajoAEntregar.precio) -
                    parseFloat(trabajoAEntregar.abono)
                  ).toFixed(2)}
                  .
                </div>
              )}

              {/* Selector de Método de Pago Final */}
              <div className="mb-6 text-left">
                <label className="block text-sm font-bold text-slate-600 mb-2">
                  Método de Pago Final:
                </label>
                <select
                  value={metodoPagoFinal}
                  onChange={(e) => setMetodoPagoFinal(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-200 text-slate-800 text-lg font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500"
                >
                  <option value="Efectivo">💵 Efectivo</option>
                  <option value="Transferencia">💳 Transferencia</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setTrabajoAEntregar(null)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-lg font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={ejecutarEntrega}
                  className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} /> Entregar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trabajos;
