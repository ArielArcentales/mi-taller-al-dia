import { useState, useEffect } from "react";
import axios from "axios";
import FormularioInventario from "../components/inventario/FormularioInventario";
import DirectorioInventario from "../components/inventario/DirectorioInventario";
import ModalAjusteStock from "../components/inventario/ModalAjusteStock";
import ModalArchivarMaterial from "../components/inventario/ModalArchivarMaterial";
import ModalHistorialInventario from "../components/inventario/ModalHistorialInventario";

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
  const [guardandoAjuste, setGuardandoAjuste] = useState(false);

  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });
  const [mensajeModalAjuste, setMensajeModalAjuste] = useState({
    texto: "",
    tipo: "",
  });

  const [modalAjuste, setModalAjuste] = useState({
    visible: false,
    producto: null,
    tipo: "Entrada",
    cantidad: "",
    motivo: "",
  });

  const [formulario, setFormulario] = useState({
    nombre: "",
    categoria: "",
    unidad_medida: "Unidades",
    cantidad_actual: "",
    stock_minimo: "5",
    precio_costo: "",
  });

  const categoriasTaller = [
    "Suelas y Tapas",
    "Pegamentos y Químicos",
    "Hilos y Agujas",
    "Plantillas",
    "Cierres y Herrajes",
    "Cueros y Telas",
    "Herramientas",
    "Pinturas",
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
      setInventario(res.data || []);
    } catch (error) {
      console.error(error);
      setMensaje({ texto: "Error al cargar inventario", tipo: "error" });
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => {
    const cargarModulo = async () => {
      await obtenerInventario();
    };
    cargarModulo();
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

  // === VALIDACIÓN MANUAL AÑADIDA AQUÍ ===
  const guardarProducto = async (e) => {
    e.preventDefault();
    setMensaje({ texto: "", tipo: "" });

    // Validamos que los campos obligatorios no estén vacíos
    if (
      !formulario.nombre.trim() ||
      formulario.cantidad_actual === "" ||
      formulario.stock_minimo === ""
    ) {
      setMensaje({
        texto: "Por favor, completa el nombre, la cantidad y el stock mínimo.",
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
        cantidad_actual: parseInt(formulario.cantidad_actual || 0),
        stock_minimo: parseInt(formulario.stock_minimo || 0),
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

  const procesarAjusteStock = async (e) => {
    e.preventDefault();
    setMensajeModalAjuste({ texto: "", tipo: "" });

    const cantidadModificar = parseInt(modalAjuste.cantidad || 0);
    const esEntrada = modalAjuste.tipo === "Entrada";
    const stockActual =
      modalAjuste.producto?.cantidad_actual ||
      modalAjuste.producto?.amount_actual ||
      0;

    // Validación manual para el Modal
    if (cantidadModificar <= 0 || !modalAjuste.motivo.trim()) {
      setMensajeModalAjuste({
        texto: "Por favor, completa la cantidad y la justificación.",
        tipo: "error",
      });
      return;
    }
    if (!esEntrada && cantidadModificar > stockActual) {
      setMensajeModalAjuste({
        texto: `No puedes retirar más del stock disponible (${stockActual}).`,
        tipo: "error",
      });
      return;
    }

    setGuardandoAjuste(true);
    try {
      const token = localStorage.getItem("token");
      const nuevoTotal = esEntrada
        ? stockActual + cantidadModificar
        : stockActual - cantidadModificar;
      const payload = {
        ...modalAjuste.producto,
        cantidad_actual: nuevoTotal,
        motivo: modalAjuste.motivo,
      };

      await axios.put(
        `http://localhost:3000/api/inventario/${modalAjuste.producto.id_producto}`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setModalAjuste({
        visible: false,
        producto: null,
        tipo: "Entrada",
        cantidad: "",
        motivo: "",
      });
      obtenerInventario(busqueda);
      setMensaje({ texto: "Stock actualizado correctamente.", tipo: "exito" });
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
    } catch (error) {
      setMensajeModalAjuste({
        texto: error.response?.data?.mensaje || "Error al procesar ajuste.",
        tipo: "error",
      });
    } finally {
      setGuardandoAjuste(false);
    }
  };

  const ejecutarArchivado = async () => {
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
      setMensaje({ texto: "Material archivado correctamente.", tipo: "exito" });
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
    } catch (error) {
      console.error(error);
      setMensaje({ texto: "Error al archivar el material.", tipo: "error" });
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
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
      setHistorial(res.data || []);
    } catch (error) {
      console.error(error);
      setMensaje({ texto: "No se pudo cargar el historial.", tipo: "error" });
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
    } finally {
      setCargandoHistorial(false);
    }
  };

  const iniciarEdicion = (producto) => {
    setIdEdicion(producto.id_producto);
    setFormulario({
      nombre: producto.nombre,
      categoria: producto.categoria || "",
      unidad_medida: producto.unidad_medida || "Unidades",
      cantidad_actual:
        producto.cantidad_actual !== undefined
          ? producto.cantidad_actual
          : producto.amount_actual,
      stock_minimo: producto.stock_minimo,
      precio_costo: producto.precio_costo || "",
    });
  };

  return (
    <>
      <ModalAjusteStock
        modalAjuste={modalAjuste}
        setModalAjuste={setModalAjuste}
        onClose={() => {
          setModalAjuste({
            visible: false,
            producto: null,
            tipo: "Entrada",
            cantidad: "",
            motivo: "",
          });
          setMensajeModalAjuste({ texto: "", tipo: "" });
        }}
        onConfirm={procesarAjusteStock}
        guardandoAjuste={guardandoAjuste}
        mensajeModal={mensajeModalAjuste}
      />

      <ModalArchivarMaterial
        producto={productoAArchivar}
        onClose={() => setProductoAArchivar(null)}
        onConfirm={ejecutarArchivado}
      />

      <ModalHistorialInventario
        producto={productoHistorial}
        historial={historial}
        cargandoHistorial={cargandoHistorial}
        onClose={() => setProductoHistorial(null)}
      />

      <div className="flex flex-col gap-6 h-[calc(100vh-80px)] w-full overflow-hidden relative z-0 pb-6">
        <header className="shrink-0 pt-2">
          <h2 className="text-4xl font-black text-slate-800">
            Control de Inventario
          </h2>
          <p className="text-lg text-slate-600 mt-2">
            Gestiona los materiales, insumos y herramientas del taller.
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 min-h-0">
          <FormularioInventario
            formulario={formulario}
            setFormulario={setFormulario}
            idEdicion={idEdicion}
            guardando={guardando}
            mensaje={mensaje}
            onGuardar={guardarProducto}
            onCancelar={cancelarEdicion}
            categoriasTaller={categoriasTaller}
            unidadesMedida={unidadesMedida}
          />

          <DirectorioInventario
            inventarioFiltrado={inventarioFiltrado}
            cargandoLista={cargandoLista}
            busqueda={busqueda}
            onBusqueda={manejarBusqueda}
            filtroCategoria={filtroCategoria}
            setFiltroCategoria={setFiltroCategoria}
            categoriasTaller={categoriasTaller}
            idEdicion={idEdicion}
            onAbrirAjuste={(item) => {
              setModalAjuste({
                visible: true,
                producto: item,
                tipo: "Entrada",
                cantidad: "",
                motivo: "",
              });
              setMensajeModalAjuste({ texto: "", tipo: "" });
            }}
            onVerHistorial={verHistorial}
            onEditar={iniciarEdicion}
            onArchivar={setProductoAArchivar}
          />
        </div>
      </div>
    </>
  );
};

export default Inventario;
