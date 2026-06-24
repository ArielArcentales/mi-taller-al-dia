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
  Filter,
  ChevronDown,
  Ruler,
  ArrowRightLeft,
  FileText,
  Calendar,
} from "lucide-react";
import axios from "axios";

const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");

  const [idEdicion, setIdEdicion] = useState(null);
  const [productoAArchivar, setProductoAArchivar] = useState(null);

  const [productoHistorial, setProductoHistorial] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  // Estado para controlar el modal de Ajuste Rápido de Stock
  const [modalAjuste, setModalAjuste] = useState({
    visible: false,
    producto: null,
    tipo: "Entrada", // 'Entrada' o 'Salida'
    cantidad: "",
    motivo: "",
  });
  const [guardandoAjuste, setGuardandoAjuste] = useState(false);

  // Estados para los menús desplegables customizados
  const [mostrarDropdownCatForm, setMostrarDropdownCatForm] = useState(false);
  const [mostrarDropdownUnidad, setMostrarDropdownUnidad] = useState(false);
  const [mostrarDropdownFiltro, setMostrarDropdownFiltro] = useState(false);

  const [formulario, setFormulario] = useState({
    nombre: "",
    categoria: "",
    unidad_medida: "Unidades",
    cantidad_actual: "",
    stock_minimo: "5",
    precio_costo: "",
  });

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

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

  const unidadesMedida = [
    "Unidades",
    "Pares",
    "Metros",
    "Centímetros",
    "Litros",
    "Mililitros",
    "Kilos",
    "Gramos",
    "Cajas",
    "Rollos",
  ];

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

  useEffect(() => {
    const inicializarPantalla = async () => {
      await obtenerInventario();
    };
    inicializarPantalla();
  }, []);

  const manejarBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    obtenerInventario(valor);
  };

  const inventarioFiltrado = inventario.filter((item) => {
    if (filtroCategoria === "") return true;
    return item.categoria === filtroCategoria;
  });

  const manejarCambioFormulario = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const iniciarEdicion = (producto) => {
    setIdEdicion(producto.id_producto);
    setFormulario({
      nombre: producto.nombre,
      categoria: producto.categoria || "",
      unidad_medida: producto.unidad_medida || "Unidades",
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
      unidad_medida: "Unidades",
      cantidad_actual: "",
      stock_minimo: "5",
      precio_costo: "",
    });
    setMensaje({ texto: "", tipo: "" });
  };

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
          texto: "¡Datos del material actualizados!",
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

  // ==========================================
  // LÓGICA: AJUSTE RÁPIDO DE STOCK
  // ==========================================
  const abrirAjusteStock = (producto) => {
    setModalAjuste({
      visible: true,
      producto: producto,
      tipo: "Entrada",
      cantidad: "",
      motivo: "",
    });
  };

  const cerrarAjusteStock = () => {
    setModalAjuste({
      visible: false,
      producto: null,
      tipo: "Entrada",
      cantidad: "",
      motivo: "",
    });
  };

  const procesarAjusteStock = async (e) => {
    e.preventDefault();

    if (!modalAjuste.cantidad || parseInt(modalAjuste.cantidad) <= 0) {
      alert("Por favor, ingresa una cantidad válida mayor a 0.");
      return;
    }
    if (!modalAjuste.motivo.trim()) {
      alert("Debes justificar el motivo de este ajuste.");
      return;
    }

    const cantidadModificar = parseInt(modalAjuste.cantidad);
    const esEntrada = modalAjuste.tipo === "Entrada";
    const stockActual = modalAjuste.producto.cantidad_actual;

    if (!esEntrada && cantidadModificar > stockActual) {
      alert(
        `No puedes retirar ${cantidadModificar}. Solo hay ${stockActual} disponibles.`,
      );
      return;
    }

    const nuevoTotal = esEntrada
      ? stockActual + cantidadModificar
      : stockActual - cantidadModificar;
    setGuardandoAjuste(true);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...modalAjuste.producto,
        cantidad_actual: nuevoTotal,
        motivo: modalAjuste.motivo,
      };

      await axios.put(
        `http://localhost:3000/api/inventario/${modalAjuste.producto.id_producto}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      cerrarAjusteStock();
      obtenerInventario(busqueda);
    } catch (error) {
      console.error("Error al ajustar stock:", error);
      alert(error.response?.data?.mensaje || "Error al actualizar el stock");
    } finally {
      setGuardandoAjuste(false);
    }
  };

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
      <div>
        <h2 className="text-4xl font-black text-slate-800">
          Control de Inventario
        </h2>
        <p className="text-xl text-slate-600 mt-2">
          Gestiona los materiales, insumos y herramientas del taller
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ================= PANEL IZQUIERDO: FORMULARIO ================= */}
        <div
          className={`xl:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-slate-200 h-fit sticky top-8 transition-colors ${idEdicion ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200"}`}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl ${idEdicion ? "bg-blue-200 text-blue-700" : "bg-taller-100 text-taller-700"}`}
              >
                {idEdicion ? <Edit2 size={24} /> : <Package size={24} />}
              </div>
              <h3 className="text-2xl font-bold text-slate-800">
                {idEdicion ? `Datos del Material` : "Nuevo Material"}
              </h3>
            </div>
            {idEdicion && (
              <button
                onClick={cancelarEdicion}
                className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"
                title="Cancelar edición"
              >
                <X size={24} />
              </button>
            )}
          </div>

          {idEdicion && (
            <div className="bg-blue-100/50 border border-blue-200 p-4 rounded-xl mb-6">
              <p className="text-sm font-bold text-blue-800 flex items-center gap-2">
                <AlertCircle size={16} /> Para agregar o restar stock, utiliza
                el botón <ArrowRightLeft size={14} className="inline" /> en la
                lista de inventario.
              </p>
            </div>
          )}

          {mensaje.texto && (
            <div
              className={`p-4 rounded-xl mb-6 text-md font-bold flex items-center gap-2 ${mensaje.tipo === "exito" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {mensaje.tipo === "exito" ? (
                <CheckCircle2 size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              {mensaje.texto}
            </div>
          )}

          <form onSubmit={guardarProducto} className="space-y-5">
            <div>
              <label className="block text-slate-700 font-bold text-md mb-2 ml-1">
                Nombre del Material
              </label>
              <div className="relative">
                <Tag
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  name="nombre"
                  required
                  disabled={idEdicion}
                  placeholder="Ej: Suela de goma negra"
                  value={formulario.nombre}
                  onChange={manejarCambioFormulario}
                  className="w-full pl-12 pr-4 py-3.5 text-lg border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none disabled:opacity-50 disabled:bg-slate-100 bg-slate-50 font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Categoría Custom Dropdown */}
              <div>
                <label className="block text-slate-700 font-bold text-md mb-2 ml-1">
                  Categoría
                </label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={idEdicion}
                    onClick={() => {
                      setMostrarDropdownCatForm(!mostrarDropdownCatForm);
                      setMostrarDropdownUnidad(false);
                    }}
                    className="w-full pl-10 pr-3 py-3.5 text-md border-2 border-slate-200 rounded-xl outline-none text-left font-bold bg-slate-50 flex items-center justify-between disabled:opacity-50 disabled:bg-slate-100"
                  >
                    <span className="flex items-center gap-2 truncate text-slate-700">
                      <Layers className="text-slate-400 shrink-0" size={18} />
                      <span className="truncate">
                        {formulario.categoria || "Seleccionar"}
                      </span>
                    </span>
                    <ChevronDown
                      size={18}
                      className="text-slate-400 shrink-0"
                    />
                  </button>

                  {mostrarDropdownCatForm && !idEdicion && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 flex flex-col max-h-48 overflow-y-auto custom-scrollbar">
                      {categoriasTaller.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setFormulario({ ...formulario, categoria: cat });
                            setMostrarDropdownCatForm(false);
                          }}
                          className="w-full p-3 hover:bg-slate-50 transition-colors text-left font-bold text-slate-700 text-sm border-b border-slate-50 last:border-0"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Unidad Custom Dropdown */}
              <div>
                <label className="block text-slate-700 font-bold text-md mb-2 ml-1">
                  Medida en
                </label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={idEdicion}
                    onClick={() => {
                      setMostrarDropdownUnidad(!mostrarDropdownUnidad);
                      setMostrarDropdownCatForm(false);
                    }}
                    className="w-full pl-10 pr-3 py-3.5 text-md border-2 border-slate-200 rounded-xl outline-none text-left font-bold bg-slate-50 flex items-center justify-between disabled:opacity-50 disabled:bg-slate-100"
                  >
                    <span className="flex items-center gap-2 truncate text-slate-700">
                      <Ruler className="text-slate-400 shrink-0" size={18} />
                      <span className="truncate">
                        {formulario.unidad_medida}
                      </span>
                    </span>
                    <ChevronDown
                      size={18}
                      className="text-slate-400 shrink-0"
                    />
                  </button>

                  {mostrarDropdownUnidad && !idEdicion && (
                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 flex flex-col max-h-48 overflow-y-auto custom-scrollbar">
                      {unidadesMedida.map((uni) => (
                        <button
                          key={uni}
                          type="button"
                          onClick={() => {
                            setFormulario({
                              ...formulario,
                              unidad_medida: uni,
                            });
                            setMostrarDropdownUnidad(false);
                          }}
                          className="w-full p-3 hover:bg-slate-50 transition-colors text-left font-bold text-slate-700 text-sm border-b border-slate-50 last:border-0"
                        >
                          {uni}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold text-md mb-2 ml-1">
                  {idEdicion ? "Cantidad Base" : "Cantidad Inicial"}
                </label>
                <div className="relative">
                  <Package
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="number"
                    name="cantidad_actual"
                    required
                    min="0"
                    placeholder="0"
                    disabled={idEdicion} // Bloqueamos este campo si estamos editando
                    value={formulario.cantidad_actual}
                    onChange={manejarCambioFormulario}
                    className="w-full pl-11 pr-4 py-3.5 text-lg font-bold border-2 rounded-xl outline-none transition-colors bg-slate-50 text-slate-700 border-slate-200 focus:border-taller-500 disabled:opacity-50 disabled:bg-slate-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-bold text-md mb-2 ml-1">
                  Stock Mínimo
                </label>
                <div className="relative">
                  <AlertTriangle
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="number"
                    name="stock_minimo"
                    required
                    min="0"
                    placeholder="5"
                    value={formulario.stock_minimo}
                    onChange={manejarCambioFormulario}
                    className="w-full pl-11 pr-4 py-3.5 text-lg border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none bg-slate-50 font-bold text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold text-md mb-2 ml-1">
                Costo Unitario (Opcional)
              </label>
              <div className="relative">
                <DollarSign
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="number"
                  name="precio_costo"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formulario.precio_costo}
                  onChange={manejarCambioFormulario}
                  className="w-full pl-11 pr-4 py-3.5 text-lg border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none bg-slate-50 font-bold text-slate-700"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={guardando}
                className={`w-full flex items-center justify-center gap-3 text-white text-xl font-black py-4 rounded-xl transition-all disabled:opacity-70 shadow-md ${idEdicion ? "bg-blue-600 hover:bg-blue-700" : "bg-taller-950 hover:bg-taller-800"}`}
              >
                {guardando ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <Save size={24} />
                )}
                {guardando
                  ? "Guardando"
                  : idEdicion
                    ? "Actualizar Datos"
                    : "Registrar Material"}
              </button>
            </div>
          </form>
        </div>

        {/* ================= PANEL DERECHO: DIRECTORIO ================= */}
        <div className="xl:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col h-full min-h-125">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 mb-8">
            <h3 className="text-3xl font-black text-slate-800">
              Directorio de Materiales
            </h3>

            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
              {/* Buscador */}
              <div className="relative flex-1 sm:w-64">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar insumo"
                  value={busqueda}
                  onChange={manejarBusqueda}
                  className="w-full pl-12 pr-4 py-3 text-md border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none bg-slate-50 transition-all font-bold text-slate-700"
                />
              </div>

              {/* Filtro Customizado */}
              <div className="relative shrink-0 sm:w-56">
                <button
                  onClick={() =>
                    setMostrarDropdownFiltro(!mostrarDropdownFiltro)
                  }
                  className="w-full pl-11 pr-4 py-3 text-md border-2 border-slate-200 rounded-xl outline-none text-left font-bold bg-slate-50 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2 truncate text-slate-700">
                    <Filter
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      size={18}
                    />
                    <span className="truncate">
                      {filtroCategoria || "Todas las categorías"}
                    </span>
                  </span>
                  <ChevronDown size={18} className="text-slate-400 shrink-0" />
                </button>

                {mostrarDropdownFiltro && (
                  <div className="absolute right-0 top-full mt-2 w-full sm:w-64 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-50 flex flex-col max-h-72 overflow-y-auto custom-scrollbar">
                    <button
                      onClick={() => {
                        setFiltroCategoria("");
                        setMostrarDropdownFiltro(false);
                      }}
                      className="w-full p-3 hover:bg-slate-50 transition-colors text-left font-black text-slate-800 text-sm border-b border-slate-100"
                    >
                      Todas las categorías
                    </button>
                    {categoriasTaller.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setFiltroCategoria(cat);
                          setMostrarDropdownFiltro(false);
                        }}
                        className="w-full p-3 hover:bg-slate-50 transition-colors text-left font-bold text-slate-600 text-sm border-b border-slate-50 last:border-0"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
            {cargandoLista ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p className="text-xl font-bold">Cargando inventario</p>
              </div>
            ) : inventarioFiltrado.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center">
                <div className="p-6 bg-slate-100 rounded-full mb-4">
                  <Package size={56} className="text-slate-300" />
                </div>
                <p className="text-2xl font-black text-slate-500 mb-1">
                  {inventario.length === 0
                    ? "Inventario vacío"
                    : "No hay coincidencias"}
                </p>
                <p className="text-md font-medium mt-1">
                  {inventario.length === 0
                    ? "Usa el formulario para registrar un material."
                    : "Prueba con otra búsqueda o categoría."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {inventarioFiltrado.map((item) => {
                  const esBajoStock = item.cantidad_actual <= item.stock_minimo;
                  const sinStock = item.cantidad_actual === 0;
                  const unidadMedida = item.unidad_medida || "Unidades";
                  const estaSiendoEditado = idEdicion === item.id_producto;

                  return (
                    <div
                      key={item.id_producto}
                      className={`p-6 border-2 rounded-2xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-5 ${estaSiendoEditado ? "border-blue-300 bg-blue-50/30" : sinStock ? "bg-red-50 border-red-200" : esBajoStock ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100 hover:border-taller-200"}`}
                    >
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          {item.categoria && (
                            <span className="text-[10px] uppercase tracking-wider font-black bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-md shadow-sm">
                              {item.categoria}
                            </span>
                          )}
                          {sinStock ? (
                            <span className="flex items-center gap-1.5 text-red-600 font-black text-[10px] uppercase tracking-wider bg-red-100 px-2.5 py-1 rounded-md">
                              <AlertTriangle size={14} /> Agotado
                            </span>
                          ) : (
                            esBajoStock && (
                              <span className="flex items-center gap-1.5 text-amber-600 font-black text-[10px] uppercase tracking-wider bg-amber-100 px-2.5 py-1 rounded-md">
                                <AlertCircle size={14} /> Stock Bajo
                              </span>
                            )
                          )}
                        </div>

                        <h4 className="text-2xl font-black text-slate-800 capitalize leading-tight mt-1 truncate">
                          {item.nombre}
                        </h4>

                        <div className="flex items-center gap-4 mt-2">
                          {item.precio_costo > 0 && (
                            <p className="text-md font-bold text-slate-500 flex items-center gap-1.5">
                              <DollarSign
                                size={18}
                                className="text-slate-400"
                              />{" "}
                              Costo: ${parseFloat(item.precio_costo).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col justify-between items-center sm:items-end gap-4 min-w-55 shrink-0 border-t sm:border-t-0 border-slate-200 pt-4 sm:pt-0 mt-2 sm:mt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
                            Disponibles
                          </p>
                          <div className="flex items-end sm:justify-end gap-1.5">
                            <p
                              className={`text-4xl font-black leading-none ${sinStock ? "text-red-600" : esBajoStock ? "text-amber-600" : "text-slate-800"}`}
                            >
                              {item.cantidad_actual}
                            </p>
                            <div className="flex flex-col items-start sm:items-end">
                              <span className="text-sm font-black text-slate-700 capitalize leading-none mb-0.5">
                                {unidadMedida}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                                MIN {item.stock_minimo}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 w-full sm:w-auto justify-end mt-1">
                          <button
                            onClick={() => abrirAjusteStock(item)}
                            className="p-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 font-bold text-sm"
                            title="Ajustar Stock (+/-)"
                          >
                            <ArrowRightLeft size={18} /> Ajustar
                          </button>
                          <div className="w-px bg-slate-200 mx-1"></div>{" "}
                          {/* Separador */}
                          <button
                            onClick={() => verHistorial(item)}
                            className="p-3 text-taller-600 bg-white border border-taller-200 hover:bg-taller-50 rounded-xl transition-colors shadow-sm"
                            title="Ver Historial (Entradas/Salidas)"
                          >
                            <History size={20} />
                          </button>
                          <button
                            onClick={() => iniciarEdicion(item)}
                            className={`p-3 rounded-xl transition-colors shadow-sm border ${estaSiendoEditado ? "bg-blue-600 text-white border-blue-600" : "text-blue-600 bg-white border-blue-200 hover:bg-blue-50"}`}
                            title="Editar Datos"
                          >
                            <Edit2 size={20} />
                          </button>
                          <button
                            onClick={() => setProductoAArchivar(item)}
                            className="p-3 text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-sm"
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

      {/* ============================================================== */}
      {/* MODAL: AJUSTE RÁPIDO DE STOCK (HU-14 y HU-17)                 */}
      {/* ============================================================== */}
      {modalAjuste.visible && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-4xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <ArrowRightLeft className="text-slate-600" size={24} />{" "}
                  Ajustar Stock
                </h3>
                <p className="text-slate-500 font-bold mt-1 capitalize">
                  {modalAjuste.producto?.nombre}
                </p>
              </div>
              <button
                onClick={cerrarAjusteStock}
                className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={procesarAjusteStock}
              className="p-6 flex flex-col gap-6"
            >
              {/* Toggle Entrada / Salida */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() =>
                    setModalAjuste({ ...modalAjuste, tipo: "Entrada" })
                  }
                  className={`flex-1 py-3 text-md font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${modalAjuste.tipo === "Entrada" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <ArrowUpRight size={20} /> Agregar (+)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setModalAjuste({ ...modalAjuste, tipo: "Salida" })
                  }
                  className={`flex-1 py-3 text-md font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${modalAjuste.tipo === "Salida" ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <ArrowDownRight size={20} /> Retirar (-)
                </button>
              </div>

              <div className="flex flex-col gap-1 items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <span className="text-slate-500 font-bold text-sm">
                  Stock Disponible Actual
                </span>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-slate-800">
                    {modalAjuste.producto?.cantidad_actual}
                  </span>
                  <span className="text-sm font-bold text-slate-500 mb-1">
                    {modalAjuste.producto?.unidad_medida || "Unidades"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-md mb-2 ml-1">
                  Cantidad a{" "}
                  {modalAjuste.tipo === "Entrada" ? "ingresar" : "retirar"}
                </label>
                <div className="relative">
                  <Package
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Ej: 5"
                    value={modalAjuste.cantidad}
                    onChange={(e) =>
                      setModalAjuste({
                        ...modalAjuste,
                        cantidad: e.target.value,
                      })
                    }
                    className={`w-full pl-12 pr-4 py-3 text-xl font-black border-2 rounded-xl outline-none transition-colors ${modalAjuste.tipo === "Entrada" ? "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 border-slate-200" : "focus:border-red-500 focus:ring-4 focus:ring-red-100 border-slate-200"}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold text-md mb-2 ml-1">
                  Motivo o Justificación
                </label>
                <div className="relative">
                  <FileText
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={20}
                  />
                  <input
                    type="text"
                    required
                    placeholder={
                      modalAjuste.tipo === "Entrada"
                        ? "Ej: Compra a proveedor local"
                        : "Ej: Uso en reparación #102"
                    }
                    value={modalAjuste.motivo}
                    onChange={(e) =>
                      setModalAjuste({ ...modalAjuste, motivo: e.target.value })
                    }
                    className="w-full pl-12 pr-4 py-3 text-md font-medium border-2 border-slate-200 rounded-xl focus:border-slate-800 outline-none transition-colors bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={guardandoAjuste}
                  className={`w-full flex items-center justify-center gap-2 text-white text-lg font-black py-4 rounded-2xl transition-all disabled:opacity-70 shadow-lg ${modalAjuste.tipo === "Entrada" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
                >
                  {guardandoAjuste ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <Save size={24} />
                  )}
                  {guardandoAjuste
                    ? "Procesando..."
                    : `Confirmar ${modalAjuste.tipo}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Confirmar Archivado */}
      {productoAArchivar && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-4xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 p-8 flex flex-col items-center text-center border-b border-slate-100">
              <div className="w-20 h-20 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mb-5 shadow-sm">
                <Archive size={36} />
              </div>
              <h3 className="text-3xl font-black text-slate-800">
                ¿Archivar Material?
              </h3>
              <p className="text-slate-600 mt-3 text-lg font-medium leading-snug">
                Se ocultará{" "}
                <span className="font-black text-slate-800">
                  {productoAArchivar.nombre}
                </span>{" "}
                del catálogo activo.
              </p>
            </div>
            <div className="p-8 bg-white">
              <p className="text-slate-500 text-center text-sm font-bold mb-8">
                Esta acción no elimina el historial de movimientos asociados a
                este material, manteniendo segura la auditoría.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setProductoAArchivar(null)}
                  className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-lg font-bold rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={ejecutarArchivado}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-900 text-white text-lg font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg"
                >
                  <Archive size={20} /> Archivar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Historial de Entradas y Salidas */}
      {productoHistorial && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-4xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                  <div className="p-2 bg-taller-100 text-taller-600 rounded-lg">
                    <History size={24} />
                  </div>
                  Historial de Movimientos
                </h3>
                <p className="text-slate-500 font-bold mt-2 text-lg">
                  Material:{" "}
                  <span className="text-slate-800 capitalize font-black">
                    {productoHistorial.nombre}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setProductoHistorial(null)}
                className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors shadow-sm"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-white custom-scrollbar">
              {cargandoHistorial ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                  <Loader2 className="animate-spin mb-4" size={40} />
                  <p className="font-bold text-lg">Consultando registros</p>
                </div>
              ) : historial.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-slate-400 h-48">
                  <Package size={48} className="mb-4 opacity-50" />
                  <p className="font-bold text-xl text-slate-500">
                    No hay movimientos registrados.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {historial.map((mov) => {
                    const esEntrada = mov.tipo_movimiento === "Entrada";
                    return (
                      <div
                        key={mov.id_movimiento}
                        className="flex justify-between items-center p-5 border-2 border-slate-100 rounded-2xl bg-slate-50 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center gap-5">
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-2 ${esEntrada ? "bg-emerald-100 text-emerald-600 border-emerald-200" : "bg-red-100 text-red-600 border-red-200"}`}
                          >
                            {esEntrada ? (
                              <ArrowUpRight size={28} />
                            ) : (
                              <ArrowDownRight size={28} />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-black text-slate-800 text-xl">
                                {esEntrada ? "Entrada" : "Salida"} de Stock
                              </p>
                            </div>
                            <p className="text-sm font-bold text-slate-400 flex items-center gap-1.5">
                              <Calendar size={14} />
                              {new Date(mov.fecha_movimiento).toLocaleString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                            <p className="text-md font-bold text-slate-600 mt-1.5">
                              Razón:{" "}
                              <span className="text-slate-800">
                                {mov.motivo || "No especificada"}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div
                          className={`text-4xl font-black ${esEntrada ? "text-emerald-600" : "text-red-600"}`}
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
