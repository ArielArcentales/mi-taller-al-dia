import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  User,
  Phone,
  FileText,
  Save,
  Loader2,
} from "lucide-react";
import axios from "axios";

const Clientes = () => {
  // Estados para almacenar los datos de la base de datos
  const [clientes, setClientes] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Estados para el formulario de nuevo cliente
  const [nuevoCliente, setNuevoCliente] = useState({
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
          headers: { Authorization: `Bearer ${token}` }, // Mandamos el token de seguridad
        },
      );
      setClientes(respuesta.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    } finally {
      setCargandoLista(false);
    }
  };

  // Se ejecuta automáticamente al abrir la pantalla
  useEffect(() => {
    const inicializarPantalla = async () => {
      await obtenerClientes();
    };

    inicializarPantalla();
  }, []);

  // Manejador del campo de búsqueda
  const manejarBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    obtenerClientes(valor);
  };

  // Manejador de los inputs del formulario
  const manejarCambioFormulario = (e) => {
    setNuevoCliente({ ...nuevoCliente, [e.target.name]: e.target.value });
  };

  // Función para guardar un nuevo cliente
  const registrarCliente = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/api/clientes", nuevoCliente, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMensaje({ texto: "¡Cliente registrado con éxito!", tipo: "exito" });
      setNuevoCliente({ nombre_completo: "", telefono: "", notas: "" }); // Limpiar formulario
      obtenerClientes(); // Recargar la lista para ver al nuevo
    } catch (error) {
      const errorMsg =
        error.response?.data?.mensaje || "Error al registrar cliente";
      setMensaje({ texto: errorMsg, tipo: "error" });
    } finally {
      setGuardando(false);
      // Borrar el mensaje después de 4 segundos
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Título de la sección */}
      <div>
        <h2 className="text-4xl font-black text-slate-800">
          Gestión de Clientes
        </h2>
        <p className="text-xl text-slate-600 mt-2">
          Registra y busca a los clientes del taller.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* PANEL IZQUIERDO: Formulario de Registro (HU-18) */}
        <div className="xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-taller-100 text-taller-700 rounded-lg">
              <Plus size={28} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">Nuevo Cliente</h3>
          </div>

          {mensaje.texto && (
            <div
              className={`p-4 rounded-xl mb-6 text-lg font-bold ${mensaje.tipo === "exito" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={registrarCliente} className="space-y-6">
            <div>
              <label className="block text-slate-700 font-bold text-lg mb-2">
                Nombre Completo *
              </label>
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={24}
                />
                <input
                  type="text"
                  name="nombre_completo"
                  required
                  value={nuevoCliente.nombre_completo}
                  onChange={manejarCambioFormulario}
                  placeholder="Ej: María Pérez"
                  className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-lg mb-2">
                Teléfono / Celular *
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={24}
                />
                <input
                  type="text"
                  name="telefono"
                  required
                  value={nuevoCliente.telefono}
                  onChange={manejarCambioFormulario}
                  placeholder="Ej: 0991234567"
                  className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-lg mb-2">
                Notas (Opcional)
              </label>
              <div className="relative">
                <FileText
                  className="absolute left-4 top-4 text-slate-400"
                  size={24}
                />
                <textarea
                  name="notas"
                  rows="3"
                  value={nuevoCliente.notas}
                  onChange={manejarCambioFormulario}
                  placeholder="Ej: Cliente frecuente, prefiere entregas a domicilio..."
                  className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none resize-none"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="w-full flex items-center justify-center gap-3 bg-taller-950 hover:bg-taller-800 text-white text-2xl font-bold py-5 rounded-xl transition-all disabled:opacity-70"
            >
              {guardando ? (
                <Loader2 className="animate-spin" size={28} />
              ) : (
                <Save size={28} />
              )}
              {guardando ? "Guardando..." : "Registrar Cliente"}
            </button>
          </form>
        </div>

        {/* PANEL DERECHO: Lista y Búsqueda de Clientes (HU-19) */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full .min-h-[500px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-2xl font-bold text-slate-800">
              Directorio de Clientes
            </h3>

            {/* Buscador interactivo */}
            <div className="relative w-full md:w-72">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={24}
              />
              <input
                type="text"
                placeholder="Buscar por nombre o celular..."
                value={busqueda}
                onChange={manejarBusqueda}
                className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-full focus:border-taller-500 outline-none bg-slate-50"
              />
            </div>
          </div>

          {/* Tabla / Lista de resultados */}
          <div className="flex-1 overflow-auto">
            {cargandoLista ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="text-xl">Cargando directorio...</p>
              </div>
            ) : clientes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                <User size={64} className="mb-4 opacity-50" />
                <p className="text-2xl font-bold text-slate-500">
                  No se encontraron clientes
                </p>
                <p className="text-lg mt-2">
                  Usa el formulario de la izquierda para registrar el primero.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {clientes.map((cliente) => (
                  <div
                    key={cliente.id_cliente}
                    className="p-5 border-2 border-slate-100 rounded-xl hover:border-taller-200 transition-colors bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="text-2xl font-bold text-slate-800 capitalize">
                        {cliente.nombre_completo}
                      </h4>
                      <p className="text-lg text-slate-500 flex items-center gap-2 mt-1">
                        <Phone size={18} /> {cliente.telefono}
                      </p>
                    </div>
                    {cliente.notas && (
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-slate-600 text-md max-w-sm w-full md:w-auto">
                        <p className="line-clamp-2">
                          <strong>Nota:</strong> {cliente.notas}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
