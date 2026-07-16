import { useState, useEffect } from "react";
import axios from "axios";
import FormularioCliente from "../components/FormularioCliente";
import DirectorioClientes from "../components/DirectorioClientes";
import ModalDetalleCliente from "../components/ModalDetalleCliente";
import ModalAnularCliente from "../components/ModalAnularCliente";

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Estados para los modales
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null); // Abre Detalles
  const [clienteAAnular, setClienteAAnular] = useState(null); // Abre Confirmación Borrar

  const [modoEdicion, setModoEdicion] = useState(null);
  const [datosFormulario, setDatosFormulario] = useState({
    nombre_completo: "",
    telefono: "",
    notas: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", tipo: "" });

  const obtenerClientes = async (termino = "") => {
    setCargandoLista(true);
    try {
      const token = localStorage.getItem("token");
      const respuesta = await axios.get(
        `http://localhost:3000/api/clientes?q=${termino}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setClientes(respuesta.data);
    } catch (error) {
      console.error("Error al obtener clientes:", error);
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      await obtenerClientes();
    };
    cargarDatosIniciales();
  }, []);

  const manejarBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    obtenerClientes(valor);
  };

  const manejarCambioFormulario = (e) => {
    setDatosFormulario({ ...datosFormulario, [e.target.name]: e.target.value });
    if (mensaje.tipo === "error") setMensaje({ texto: "", tipo: "" });
  };

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
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMensaje({ texto: "¡Cliente actualizado con éxito!", tipo: "exito" });
      } else {
        await axios.post(
          "http://localhost:3000/api/clientes",
          datosFormulario,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setMensaje({ texto: "¡Cliente registrado con éxito!", tipo: "exito" });
      }
      cancelarEdicion();
      obtenerClientes();
    } catch (error) {
      setMensaje({
        texto: error.response?.data?.mensaje || "Error al guardar el cliente",
        tipo: "error",
      });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
    }
  };

  const manejarEditar = (cliente) => {
    setModoEdicion(cliente.id_cliente);
    setDatosFormulario({
      nombre_completo: cliente.nombre_completo,
      telefono: cliente.telefono,
      notas: cliente.notas || "",
    });
    setMensaje({ texto: "", tipo: "" });
  };

  const cancelarEdicion = () => {
    setModoEdicion(null);
    setDatosFormulario({ nombre_completo: "", telefono: "", notas: "" });
    setMensaje({ texto: "", tipo: "" });
  };

  const confirmarAnulacion = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:3000/api/clientes/${clienteAAnular.id_cliente}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMensaje({ texto: "Cliente eliminado del sistema.", tipo: "exito" });
      obtenerClientes();
    } catch (error) {
      setMensaje({
        texto: error.response?.data?.mensaje || "Error al eliminar el cliente",
        tipo: "error",
      });
    } finally {
      setClienteAAnular(null);
      setTimeout(() => setMensaje({ texto: "", tipo: "" }), 4000);
    }
  };

  return (
    <>
      <ModalAnularCliente
        cliente={clienteAAnular}
        onClose={() => setClienteAAnular(null)}
        onConfirm={confirmarAnulacion}
      />

      <ModalDetalleCliente
        cliente={clienteSeleccionado}
        onClose={() => setClienteSeleccionado(null)}
        onEditar={manejarEditar}
        onAnular={setClienteAAnular}
      />

      {/* CLAVE: h-[calc(100vh-80px)] fija el alto al tamaño de ventana menos el header. overflow-hidden bloquea scroll general */}
      <div className="flex flex-col gap-6 h-[calc(100vh-80px)] w-full overflow-hidden relative z-0 pb-6">
        <header className="shrink-0 pt-2">
          <h2 className="text-4xl font-black text-slate-800">
            Gestión de Clientes
          </h2>
          <p className="text-lg text-slate-600 mt-2">
            Registra y busca a los clientes del taller.
          </p>
        </header>

        {/* El grid ocupa el espacio restante y usa min-h-0 para habilitar scroll interno de sus hijos */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 flex-1 min-h-0">
          <FormularioCliente
            datosFormulario={datosFormulario}
            modoEdicion={modoEdicion}
            guardando={guardando}
            mensaje={mensaje}
            onCambio={manejarCambioFormulario}
            onGuardar={guardarCliente}
            onCancelar={cancelarEdicion}
          />

          <DirectorioClientes
            clientes={clientes}
            busqueda={busqueda}
            cargandoLista={cargandoLista}
            modoEdicion={modoEdicion}
            onBusqueda={manejarBusqueda}
            onVerDetalle={setClienteSeleccionado} // Abre el modal
          />
        </div>
      </div>
    </>
  );
};

export default Clientes;
