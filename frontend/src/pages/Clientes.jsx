import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  User,
  Phone,
  FileText,
  Save,
  Loader2,
  Edit,
  Trash2,
  AlertTriangle,
  XCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";

const Clientes = () => {
  // Estados de control de datos y peticiones
  const [clientes, setClientes] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Estados de la interfaz
  const [clienteExpandido, setClienteExpandido] = useState(null);
  const [clienteAAnular, setClienteAAnular] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(null);

  // Estados del formulario
  const [datosFormulario, setDatosFormulario] = useState({
    nombre_completo: "",
    telefono: "",
    notas: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // Función para obtener la lista de clientes desde el backend
  const obtenerClientes = async (termino = "") => {
    setCargandoLista(true);
    try {
      const token = localStorage.getItem("token");
      const respuesta = await axios.get(
        `http://localhost:3000/api/clientes?q=${termino}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setClientes(respuesta.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    } finally {
      setCargandoLista(false);
    }
  };

  // Carga inicial al montar el componente
  useEffect(() => {
    const inicializarPantalla = async () => {
      await obtenerClientes();
    };
    inicializarPantalla();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manejador del campo de búsqueda
  const manejarBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    obtenerClientes(valor);
  };

  // Manejador de los inputs del formulario
  const manejarCambioFormulario = (e) => {
    setDatosFormulario({ ...datosFormulario, [e.target.name]: e.target.value });
    if (mensaje.tipo === "error") setMensaje({ texto: "", tipo: "" });
  };

  // Función Guardar Cliente (Crear o Actualizar)
  const guardarCliente = async (e) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    if (
      !datosFormulario.nombre_completo.trim() ||
      !datosFormulario.telefono.trim()
    ) {
      setMensaje({
        texto: "Por favor, completa el nombre y el teléfono.",
        tipo: "error",
      });
      return;
    }

    setGuardando(true);

    try {
      const token = localStorage.getItem("token");

      if (modoEdicion) {
        await axios.put(
          `http://localhost:3000/api/clientes/${modoEdicion}`,
          datosFormulario,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setMensaje({ texto: "¡Cliente actualizado con éxito!", tipo: "exito" });
      } else {
        await axios.post(
          "http://localhost:3000/api/clientes",
          datosFormulario,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setMensaje({ texto: "¡Cliente registrado con éxito!", tipo: "exito" });
      }

      cancelarEdicion();
      obtenerClientes();
    } catch (error) {
      const errorMsg =
        error.response?.data?.mensaje || "Error al guardar el cliente";
      setMensaje({ texto: errorMsg, tipo: "error" });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
    }
  };

  // Cambia el estado de la tarjeta deslizada
  const alternarExpansion = (id) => {
    if (clienteExpandido === id) {
      setClienteExpandido(null);
    } else {
      setClienteExpandido(id);
    }
  };

  // Carga los datos al formulario para editar
  const manejarEditar = (cliente) => {
    setModoEdicion(cliente.id_cliente);
    setDatosFormulario({
      nombre_completo: cliente.nombre_completo,
      telefono: cliente.telefono,
      notas: cliente.notas || "",
    });
    setClienteExpandido(null);
    setMensaje({ texto: "", tipo: "" });
  };

  // Limpia el formulario
  const cancelarEdicion = () => {
    setModoEdicion(null);
    setDatosFormulario({ nombre_completo: "", telefono: "", notas: "" });
    setMensaje({ texto: "", tipo: "" });
  };

  // Abre el modal de confirmación
  const iniciarAnulacion = (cliente) => {
    setClienteAAnular(cliente);
  };

  // Función Eliminar Cliente
  const confirmarAnulacion = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/clientes/${clienteAAnular.id_cliente}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setMensaje({ texto: "Cliente eliminado del sistema.", tipo: "exito" });
      obtenerClientes();
    } catch (error) {
      const errorMsg =
        error.response?.data?.mensaje || "Error al eliminar el cliente";
      setMensaje({ texto: errorMsg, tipo: "error" });
    } finally {
      setClienteAAnular(null);
      setClienteExpandido(null);
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
    }
  };

  return (
    <>
      {clienteAAnular && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 md:p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-red-100 text-red-600 rounded-full">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-3xl font-black text-slate-800">
                ¿Anular cliente?
              </h3>
            </div>

            <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
              Estás a punto de anular el registro de{" "}
              <span className="font-black text-slate-800">
                {clienteAAnular.nombre_completo}
              </span>
              . Esta acción no se puede deshacer. ¿Deseas continuar?
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setClienteAAnular(null)}
                className="flex-1 py-5 text-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAnulacion}
                className="flex-1 py-5 text-xl font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg shadow-red-600/30"
              >
                Sí, anular cliente
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 relative z-0">
        <div className="mb-2">
          <h2 className="text-4xl font-black text-slate-800">
            Gestión de Clientes
          </h2>
          <p className="text-xl text-slate-600 mt-2">
            Registra y busca a los clientes del taller
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-5 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 h-fit transition-all duration-300">
            <div className="flex items-center gap-4 mb-8">
              <div
                className={`p-4 rounded-2xl ${modoEdicion ? "bg-blue-100 text-blue-700" : "bg-taller-100 text-taller-700"}`}
              >
                {modoEdicion ? <Edit size={36} /> : <Plus size={36} />}
              </div>
              <h3 className="text-4xl font-black text-slate-800">
                {modoEdicion ? "Editar Cliente" : "Nuevo Cliente"}
              </h3>
            </div>

            {mensaje.texto && (
              <div
                className={`mb-8 flex items-center gap-4 border-2 p-5 rounded-2xl transition-all animate-in fade-in slide-in-from-top-2 
                ${mensaje.tipo === "exito" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}
              >
                {mensaje.tipo === "exito" ? (
                  <CheckCircle2 className="shrink-0" size={32} />
                ) : (
                  <AlertCircle className="shrink-0" size={32} />
                )}
                <p className="text-xl font-bold">{mensaje.texto}</p>
              </div>
            )}

            <form onSubmit={guardarCliente} className="space-y-8">
              <div>
                <label className="block text-slate-800 font-bold text-xl mb-3 ml-1">
                  Nombre Completo
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-500 transition-colors"
                    size={28}
                  />
                  <input
                    type="text"
                    name="nombre_completo"
                    value={datosFormulario.nombre_completo}
                    onChange={manejarCambioFormulario}
                    placeholder="Ej: María Pérez"
                    className="w-full pl-16 pr-5 py-5 text-2xl border-2 border-slate-200 rounded-2xl focus:border-taller-800 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-slate-800 font-bold bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold text-xl mb-3 ml-1">
                  Teléfono o Celular
                </label>
                <div className="relative group">
                  <Phone
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-500 transition-colors"
                    size={28}
                  />
                  <input
                    type="text"
                    name="telefono"
                    value={datosFormulario.telefono}
                    onChange={manejarCambioFormulario}
                    placeholder="Ej: 0991234567"
                    className="w-full pl-16 pr-5 py-5 text-2xl border-2 border-slate-200 rounded-2xl focus:border-taller-800 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-slate-800 font-bold bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-800 font-bold text-xl mb-3 ml-1">
                  Notas (Opcional)
                </label>
                <div className="relative group">
                  <FileText
                    className="absolute left-5 top-6 text-slate-400 group-focus-within:text-taller-500 transition-colors"
                    size={28}
                  />
                  <textarea
                    name="notas"
                    rows="4"
                    value={datosFormulario.notas}
                    onChange={manejarCambioFormulario}
                    placeholder="Ej: Cliente frecuente, prefiere entregas a domicilio"
                    className="w-full pl-16 pr-5 py-5 text-xl border-2 border-slate-200 rounded-2xl focus:border-taller-800 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-slate-800 font-medium bg-slate-50 resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <button
                  type="submit"
                  disabled={guardando}
                  className={`w-full flex items-center justify-center gap-3 text-white text-2xl font-black py-6 rounded-2xl transition-all disabled:opacity-70 shadow-xl
                    ${modoEdicion ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30" : "bg-taller-950 hover:bg-taller-800 shadow-taller-950/30"}`}
                >
                  {guardando ? (
                    <>
                      <Loader2 className="animate-spin" size={32} />
                      <span>Guardando</span>
                    </>
                  ) : (
                    <>
                      <Save size={32} />
                      <span>
                        {modoEdicion
                          ? "Actualizar Cliente"
                          : "Registrar Cliente"}
                      </span>
                    </>
                  )}
                </button>

                {modoEdicion && (
                  <button
                    type="button"
                    onClick={cancelarEdicion}
                    className="w-full flex items-center justify-center gap-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xl font-bold py-5 rounded-2xl transition-all"
                  >
                    <XCircle size={28} />
                    <span>Cancelar Edición</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="xl:col-span-7 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col h-full min-h-[700px]">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
              <h3 className="text-4xl font-black text-slate-800">Directorio</h3>

              <div className="relative w-full xl:w-[400px]">
                <Search
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400"
                  size={28}
                />
                <input
                  type="text"
                  placeholder="Buscar por nombre o celular..."
                  value={busqueda}
                  onChange={manejarBusqueda}
                  className="w-full pl-16 pr-5 py-5 text-xl border-2 border-slate-200 rounded-2xl focus:border-taller-500 outline-none bg-slate-50 transition-all font-medium text-slate-700"
                />
              </div>
            </div>

            <div className="flex-1 overflow-auto pr-3 pb-4">
              {cargandoLista ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-5">
                  <Loader2 className="animate-spin" size={64} />
                  <p className="text-2xl font-medium">Cargando directorio</p>
                </div>
              ) : clientes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                  <div className="p-8 bg-slate-100 rounded-full mb-6">
                    <User size={72} className="text-slate-300" />
                  </div>
                  <p className="text-4xl font-black text-slate-500 mb-3">
                    No se encontraron clientes
                  </p>
                  <p className="text-2xl font-medium">
                    Usa el formulario para registrar el primero
                  </p>
                </div>
              ) : (
                <div className="grid gap-5">
                  {clientes.map((cliente) => {
                    const estaExpandido =
                      clienteExpandido === cliente.id_cliente;
                    const estaSiendoEditado =
                      modoEdicion === cliente.id_cliente;

                    return (
                      <div
                        key={cliente.id_cliente}
                        className={`relative overflow-hidden rounded-2xl border-2 transition-colors min-h-[120px]
                          ${estaSiendoEditado ? "bg-blue-50 border-blue-200" : "bg-slate-100 border-slate-100"}`}
                      >
                        <div className="absolute inset-y-0 right-0 w-48 flex flex-col justify-center gap-3 px-4 z-0">
                          <button
                            onClick={() => manejarEditar(cliente)}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold rounded-xl text-lg transition-colors"
                          >
                            <Edit size={22} /> Editar
                          </button>
                          <button
                            onClick={() => iniciarAnulacion(cliente)}
                            className="flex items-center justify-center gap-2 w-full py-3 bg-red-100 text-red-700 hover:bg-red-200 font-bold rounded-xl text-lg transition-colors"
                          >
                            <Trash2 size={22} /> Anular
                          </button>
                        </div>

                        <div
                          onClick={() => alternarExpansion(cliente.id_cliente)}
                          className={`relative z-10 bg-white p-6 cursor-pointer border-2 transition-transform duration-300 ease-out h-full rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 min-h-[120px]
                            ${estaExpandido ? "-translate-x-48 border-taller-300 shadow-xl" : "translate-x-0 border-transparent hover:border-slate-300 shadow-sm"}`}
                        >
                          <div
                            className={`flex items-center gap-5 shrink-0 transition-transform duration-300 ease-out 
                            ${estaExpandido ? "translate-x-48" : "translate-x-0"}`}
                          >
                            <div
                              className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-black shrink-0 border-2
                              ${estaSiendoEditado ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-taller-100 text-taller-800 border-taller-200"}`}
                            >
                              {cliente.nombre_completo.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <h4 className="text-2xl font-black text-slate-800 capitalize mb-1">
                                {cliente.nombre_completo}
                              </h4>

                              <div
                                className={`transition-all duration-300 overflow-hidden 
                                ${estaExpandido ? "max-h-0 opacity-0" : "max-h-10 opacity-100 mt-1"}`}
                              >
                                <p className="text-xl text-slate-500 flex items-center gap-2 font-medium">
                                  <Phone size={20} /> {cliente.telefono}
                                </p>
                              </div>
                            </div>
                          </div>

                          {cliente.notas && (
                            <div
                              className={`bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1 sm:max-w-xs xl:max-w-sm sm:ml-auto transition-opacity duration-300
                              ${estaExpandido ? "opacity-0 invisible" : "opacity-100 visible"}`}
                            >
                              <p className="text-slate-600 text-xl font-medium flex items-start gap-3">
                                <FileText
                                  size={24}
                                  className="text-slate-400 shrink-0 mt-1"
                                />
                                <span
                                  className="line-clamp-2"
                                  title={cliente.notas}
                                >
                                  {cliente.notas}
                                </span>
                              </p>
                            </div>
                          )}
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
    </>
  );
};

export default Clientes;
