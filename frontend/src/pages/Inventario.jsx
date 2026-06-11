import { useState, useEffect } from "react";
import {
  Package,
  Search,
  Tag,
  Layers,
  DollarSign,
  Save,
  Loader2,
  Edit2,
  Archive,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  X,
  History,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import axios from "axios";

const Inventario = () => {
  // Estados para almacenar la lista de materiales y la búsqueda
  const [inventario, setInventario] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Estados para el control de la interfaz y modales
  const [idEdicion, setIdEdicion] = useState(null);
  const [productoAArchivar, setProductoAArchivar] = useState(null);

  // NUEVO: Estados para el historial de movimientos (HU-17)
  const [productoHistorial, setProductoHistorial] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    nombre: "",
    categoria: "",
    cantidad_actual: "",
    stock_minimo: "5",
    precio_costo: "",
  });

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  // Categorías predefinidas
  const categoriasTaller = [
    "Suelas y Tapas",
    "Pegamentos y Químicos",
    "Hilos y Agujas",
    "Plantillas",
    "Cierres y Herrajes",
    "Cueros y Telas",
    "Herramientas",
    "Otros",
  ];

  // Función para obtener la lista de inventario desde el backend
  const obtenerInventario = async (termino = "") => {
    setCargandoLista(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:3000/api/inventario?q=${termino}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setInventario(res.data);
    } catch (error) {
      console.error("Error al obtener inventario:", error);
    } finally {
      setCargandoLista(false);
    }
  };

  // Carga inicial al abrir la pantalla
  useEffect(() => {
    const inicializarPantalla = async () => {
      await obtenerInventario();
    };
    inicializarPantalla();
  }, []);

  // Manejador del buscador en tiempo real
  const manejarBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    obtenerInventario(valor);
  };

  // Manejador de los inputs del formulario
  const manejarCambioFormulario = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  // Preparar el formulario para actualizar stock
  const iniciarEdicion = (producto) => {
    setIdEdicion(producto.id_producto);
    setFormulario({
      nombre: producto.nombre,
      categoria: producto.categoria || "",
      cantidad_actual: producto.cantidad_actual,
      stock_minimo: producto.stock_minimo,
      precio_costo: producto.precio_costo || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelarEdicion = () => {
    setIdEdicion(null);
    setFormulario({
      nombre: "",
      categoria: "",
      cantidad_actual: "",
      stock_minimo: "5",
      precio_costo: "",
    });
    setMensaje({ texto: "", tipo: "" });
  };

  // Guardar o actualizar producto en la base de datos
  const guardarProducto = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ texto: "", tipo: "" });

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const payload = {
        ...formulario,
        cantidad_actual: parseInt(formulario.cantidad_actual),
        stock_minimo: parseInt(formulario.stock_minimo),
        precio_costo: formulario.precio_costo
          ? parseFloat(formulario.precio_costo)
          : 0,
      };

      if (idEdicion) {
        await axios.put(
          `http://localhost:3000/api/inventario/${idEdicion}`,
          payload,
          { headers },
        );
        setMensaje({
          texto: "¡Stock actualizado correctamente!",
          tipo: "exito",
        });
      } else {
        await axios.post("http://localhost:3000/api/inventario", payload, {
          headers,
        });
        setMensaje({ texto: "¡Material registrado con éxito!", tipo: "exito" });
      }

      cancelarEdicion();
      obtenerInventario(busqueda);
    } catch (error) {
      setMensaje({
        texto: error.response?.data?.mensaje || "Error al guardar el material",
        tipo: "error",
      });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
    }
  };

  // Ejecutar el borrado lógico
  const ejecutarArchivado = async () => {
    if (!productoAArchivar) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/inventario/${productoAArchivar.id_producto}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      obtenerInventario(busqueda);
      setProductoAArchivar(null);
    } catch (error) {
      console.error("Error al archivar material:", error);
      alert("Error al archivar el material");
    }
  };

  // NUEVA FUNCIÓN: Obtener y mostrar historial de movimientos (HU-17)
  const verHistorial = async (producto) => {
    setProductoHistorial(producto);
    setCargandoHistorial(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:3000/api/inventario/${producto.id_producto}/historial`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setHistorial(res.data);
    } catch (error) {
      console.error("Error al cargar historial:", error);
      alert("No se pudo cargar el historial de este material");
    } finally {
      setCargandoHistorial(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* TÍTULO DE LA SECCIÓN */}
      <div>
        <h2 className="text-4xl font-black text-slate-800">
          Control de Inventario
        </h2>
        <p className="text-xl text-slate-600 mt-2">
          Gestiona los materiales, insumos y herramientas del taller.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* PANEL IZQUIERDO: Formulario de Registro/Edición */}
        <div
          className={`xl:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-8 transition-colors ${idEdicion ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-lg ${idEdicion ? "bg-blue-200 text-blue-700" : "bg-taller-100 text-taller-700"}`}
              >
                {idEdicion ? <Edit2 size={28} /> : <Package size={28} />}
              </div>
              <h3 className="text-2xl font-bold text-slate-800">
                {idEdicion ? `Ajustar Stock` : "Nuevo Material"}
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
              {mensaje.tipo === "exito" ? (
                <CheckCircle2 size={24} />
              ) : (
                <AlertCircle size={24} />
              )}
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={guardarProducto} className="space-y-6">
            <div>
              <label className="block text-slate-700 font-bold text-lg mb-2">
                Nombre del Material *
              </label>
              <div className="relative">
                <Tag
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={24}
                />
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Ej: Suela de goma negra N°40"
                  value={formulario.nombre}
                  onChange={manejarCambioFormulario}
                  className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-lg mb-2">
                Categoría
              </label>
              <div className="relative">
                <Layers
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={24}
                />
                <select
                  name="categoria"
                  value={formulario.categoria}
                  onChange={manejarCambioFormulario}
                  className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none bg-white appearance-none"
                >
                  <option value="">Seleccione una categoría...</option>
                  {categoriasTaller.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold text-lg mb-2">
                  Cant. Actual *
                </label>
                <div className="relative">
                  <Package
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={24}
                  />
                  <input
                    type="number"
                    name="cantidad_actual"
                    required
                    min="0"
                    placeholder="0"
                    value={formulario.cantidad_actual}
                    onChange={manejarCambioFormulario}
                    className={`w-full pl-12 pr-4 py-4 text-xl font-bold border-2 rounded-xl outline-none transition-colors ${idEdicion ? "bg-white focus:border-blue-500 border-blue-200" : "border-slate-200 focus:border-taller-500"}`}
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-slate-700 font-bold text-lg mb-2"
                  title="Alerta de bajo inventario"
                >
                  Stock Mínimo *
                </label>
                <div className="relative">
                  <AlertTriangle
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={24}
                  />
                  <input
                    type="number"
                    name="stock_minimo"
                    required
                    min="0"
                    placeholder="5"
                    value={formulario.stock_minimo}
                    onChange={manejarCambioFormulario}
                    className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-lg mb-2">
                Costo Unitario (Opcional)
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={24}
                />
                <input
                  type="number"
                  name="precio_costo"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formulario.precio_costo}
                  onChange={manejarCambioFormulario}
                  className="w-full pl-12 pr-4 py-4 text-xl border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none"
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
                  ? "Actualizar Inventario"
                  : "Registrar Material"}
            </button>
          </form>
        </div>

        {/* PANEL DERECHO: Directorio y Buscador */}
        <div className="xl:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col h-full .min-h-[500px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h3 className="text-2xl font-bold text-slate-800">
              Directorio de Materiales
            </h3>

            <div className="relative w-full md:w-80">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={24}
              />
              <input
                type="text"
                placeholder="Buscar insumo o categoría..."
                value={busqueda}
                onChange={manejarBusqueda}
                className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-full focus:border-taller-500 outline-none bg-slate-50"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {cargandoLista ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="text-xl">Cargando inventario...</p>
              </div>
            ) : inventario.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                <Package size={64} className="mb-4 opacity-50" />
                <p className="text-2xl font-bold text-slate-500">
                  Inventario vacío
                </p>
                <p className="text-lg mt-2">
                  Usa el formulario para registrar el primer material.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {inventario.map((item) => {
                  const esBajoStock = item.cantidad_actual <= item.stock_minimo;
                  const sinStock = item.cantidad_actual === 0;

                  return (
                    <div
                      key={item.id_producto}
                      className={`p-5 border-2 rounded-xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${sinStock ? "bg-red-50 border-red-200" : esBajoStock ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100 hover:border-taller-200"}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.categoria && (
                            <span className="text-xs uppercase tracking-wider font-bold bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded">
                              {item.categoria}
                            </span>
                          )}
                          {sinStock ? (
                            <span className="flex items-center gap-1 text-red-600 font-bold text-xs uppercase tracking-wide bg-red-100 px-2 py-0.5 rounded">
                              <AlertTriangle size={14} /> Agotado
                            </span>
                          ) : (
                            esBajoStock && (
                              <span className="flex items-center gap-1 text-amber-600 font-bold text-xs uppercase tracking-wide bg-amber-100 px-2 py-0.5 rounded">
                                <AlertCircle size={14} /> Stock Bajo
                              </span>
                            )
                          )}
                        </div>

                        <h4 className="text-2xl font-bold text-slate-800 capitalize leading-tight mt-2">
                          {item.nombre}
                        </h4>

                        <div className="flex items-center gap-4 mt-2">
                          {item.precio_costo > 0 && (
                            <p className="text-sm font-bold text-slate-500 flex items-center gap-1">
                              <DollarSign size={16} /> Costo: $
                              {parseFloat(item.precio_costo).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-4 .min-w-[170px]">
                        <div className="text-left sm:text-right">
                          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Disponibles
                          </p>
                          <div className="flex items-end sm:justify-end gap-1">
                            <p
                              className={`text-4xl font-black leading-none ${sinStock ? "text-red-600" : esBajoStock ? "text-amber-600" : "text-slate-800"}`}
                            >
                              {item.cantidad_actual}
                            </p>
                            <span className="text-sm font-bold text-slate-400 mb-1">
                              / min {item.stock_minimo}
                            </span>
                          </div>
                        </div>

                        {/* Botones de acción integrando Historial */}
                        <div className="flex gap-2 w-full sm:w-auto justify-end mt-2 sm:mt-0">
                          <button
                            onClick={() => verHistorial(item)}
                            className="p-2.5 text-taller-600 bg-white border border-taller-200 hover:bg-taller-50 rounded-lg transition-colors shadow-sm"
                            title="Ver Historial (Entradas/Salidas)"
                          >
                            <History size={20} />
                          </button>
                          <button
                            onClick={() => iniciarEdicion(item)}
                            className="p-2.5 text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 rounded-lg transition-colors shadow-sm"
                            title="Actualizar Stock o Editar"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => setProductoAArchivar(item)}
                            className="p-2.5 text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors shadow-sm"
                            title="Archivar material"
                          >
                            <Archive size={20} />
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

      {/* MODAL: Confirmar Archivado */}
      {productoAArchivar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 p-8 flex flex-col items-center text-center border-b border-slate-200">
              <div className="w-20 h-20 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Archive size={40} />
              </div>
              <h3 className="text-3xl font-black text-slate-800">
                ¿Archivar Material?
              </h3>
              <p className="text-slate-600 mt-3 text-lg">
                Se ocultará{" "}
                <span className="font-bold">{productoAArchivar.nombre}</span>{" "}
                del catálogo activo.
              </p>
            </div>
            <div className="p-8 bg-white">
              <p className="text-slate-500 text-center text-md mb-8">
                Esta acción no elimina el historial de movimientos asociados a
                este material, manteniendo segura la auditoría.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setProductoAArchivar(null)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-lg font-bold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={ejecutarArchivado}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-900 text-white text-lg font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Archive size={20} /> Archivar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Historial de Entradas y Salidas (HU-17) */}
      {productoHistorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <History className="text-taller-600" size={28} /> Historial de
                  Movimientos
                </h3>
                <p className="text-slate-500 font-bold mt-1">
                  Material:{" "}
                  <span className="text-slate-700 capitalize">
                    {productoHistorial.nombre}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setProductoHistorial(null)}
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <div className="p-6 overflow-auto flex-1 bg-white">
              {cargandoHistorial ? (
                <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                  <Loader2 className="animate-spin mb-4" size={32} />
                  <p>Consultando registros...</p>
                </div>
              ) : historial.length === 0 ? (
                <div className="text-center text-slate-500 py-10">
                  No hay registros de movimientos para este material.
                </div>
              ) : (
                <div className="space-y-3">
                  {historial.map((mov) => {
                    const esEntrada = mov.tipo_movimiento === "Entrada";
                    return (
                      <div
                        key={mov.id_movimiento}
                        className="flex justify-between items-center p-4 border border-slate-100 rounded-xl bg-slate-50 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${esEntrada ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}`}
                          >
                            {esEntrada ? (
                              <ArrowUpRight size={24} />
                            ) : (
                              <ArrowDownRight size={24} />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-lg">
                              {esEntrada ? "Entrada" : "Salida"} de Stock
                            </p>
                            <p className="text-sm text-slate-500">
                              {new Date(mov.fecha_movimiento).toLocaleString()}
                            </p>
                            <p className="text-xs font-medium text-slate-400 mt-1 italic">
                              Razón: {mov.motivo}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-2xl font-black ${esEntrada ? "text-emerald-600" : "text-red-600"}`}
                        >
                          {esEntrada ? "+" : "-"}
                          {mov.cantidad}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventario;
