import { useState } from "react";
import {
  Plus,
  Users,
  ChevronDown,
  Search,
  Wrench,
  DollarSign,
  Calendar,
  Save,
  Loader2,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
} from "lucide-react";
import ModalCalendarioEntrega from "./ModalCalendarioEntrega";

const FormularioTrabajo = ({
  formulario,
  setFormulario,
  clientes,
  busquedaClientes,
  setBusquedaClientes,
  idEdicion,
  guardando,
  mensaje,
  onGuardar,
  onCancelar,
}) => {
  const [mostrarDropdownClientes, setMostrarDropdownClientes] = useState(false);
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const clienteSeleccionado = clientes.find(
    (c) => c.id_cliente === formulario.id_cliente,
  );
  const clientesFiltrados = clientes.filter((c) =>
    c.nombre_completo?.toLowerCase().includes(busquedaClientes.toLowerCase()),
  );

  const agregarArticulo = () => {
    setFormulario({
      ...formulario,
      articulos: [
        ...formulario.articulos,
        { id_temp: Date.now(), producto: "", reparacion: "", precio: "" },
      ],
    });
  };

  const eliminarArticulo = (id_temp) => {
    setFormulario({
      ...formulario,
      articulos: formulario.articulos.filter((art) => art.id_temp !== id_temp),
    });
  };

  const actualizarArticulo = (id_temp, campo, valor) => {
    const nuevosArticulos = formulario.articulos.map((art) =>
      art.id_temp === id_temp ? { ...art, [campo]: valor } : art,
    );
    setFormulario({ ...formulario, articulos: nuevosArticulos });
  };

  const precioTotalCalculado = formulario.articulos.reduce(
    (sum, art) => sum + (parseFloat(art.precio) || 0),
    0,
  );

  const fechaFormateada = formulario.fecha_entrega_prometida
    ? new Date(
        formulario.fecha_entrega_prometida + "T12:00:00",
      ).toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
    : "Elegir fecha...";

  return (
    <>
      {mostrarCalendario && (
        <ModalCalendarioEntrega
          fechaActual={formulario.fecha_entrega_prometida}
          onSeleccionarFecha={(fecha) => {
            setFormulario({ ...formulario, fecha_entrega_prometida: fecha });
            setMostrarCalendario(false);
          }}
          onClose={() => setMostrarCalendario(false)}
        />
      )}

      <div className="xl:col-span-4 bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col h-full min-h-0">
        <header className="shrink-0 flex items-center gap-4 mb-5">
          <div
            className={`p-3 rounded-2xl ${idEdicion ? "bg-indigo-100 text-indigo-700" : "bg-taller-100 text-taller-700"}`}
          >
            {idEdicion ? <Edit size={24} /> : <Plus size={24} />}
          </div>
          <h3 className="text-2xl font-black text-slate-800">
            {idEdicion ? "Editar Orden" : "Nueva Orden"}
          </h3>
        </header>

        {mensaje.texto && (
          <div
            className={`shrink-0 mb-4 flex items-center gap-3 border-2 p-3.5 rounded-2xl transition-all ${mensaje.tipo === "exito" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}
          >
            {mensaje.tipo === "exito" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <p className="text-sm font-bold">{mensaje.texto}</p>
          </div>
        )}

        <form onSubmit={onGuardar} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-4">
            {/* CLIENTE */}
            <div>
              <label className="block text-slate-800 font-bold text-sm mb-1.5 ml-1">
                Cliente
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMostrarDropdownClientes(!mostrarDropdownClientes);
                    setBusquedaClientes("");
                  }}
                  className="w-full pl-11 pr-4 py-3 text-sm border-2 border-slate-200 rounded-2xl outline-none text-left font-bold bg-slate-50 flex items-center justify-between"
                >
                  <span className="flex items-center gap-3 truncate">
                    <Users
                      className="absolute left-4 text-slate-400 shrink-0"
                      size={18}
                    />
                    <span className="truncate">
                      {clienteSeleccionado
                        ? clienteSeleccionado.nombre_completo
                        : "Seleccionar cliente..."}
                    </span>
                  </span>
                  <ChevronDown size={18} className="text-slate-400 shrink-0" />
                </button>
                {mostrarDropdownClientes && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-30 flex flex-col max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                      <div className="relative">
                        <Search
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                          size={16}
                        />
                        <input
                          type="text"
                          placeholder="Buscar..."
                          value={busquedaClientes}
                          onChange={(e) => setBusquedaClientes(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border-2 border-slate-200 rounded-xl outline-none focus:border-taller-500 font-medium"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                      {clientesFiltrados.map((c) => (
                        <button
                          key={c.id_cliente}
                          type="button"
                          onClick={() => {
                            setFormulario({
                              ...formulario,
                              id_cliente: c.id_cliente,
                            });
                            setMostrarDropdownClientes(false);
                          }}
                          className="w-full flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-taller-100 text-taller-800 flex items-center justify-center font-black text-xs shrink-0">
                            {c.nombre_completo.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-slate-800 truncate">
                            {c.nombre_completo}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ARTÍCULOS DINÁMICOS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label className="text-slate-800 font-bold text-sm">
                  Artículos de la Orden
                </label>
                <button
                  type="button"
                  onClick={agregarArticulo}
                  className="text-taller-600 hover:text-taller-800 text-xs font-black uppercase tracking-wider flex items-center gap-1 bg-taller-50 px-2.5 py-1.5 rounded-lg border border-taller-100"
                >
                  <Plus size={14} /> Añadir
                </button>
              </div>

              {formulario.articulos.map((art, index) => (
                <div
                  key={art.id_temp}
                  className="p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl space-y-3 relative group animate-in fade-in"
                >
                  {formulario.articulos.length > 1 && (
                    <button
                      type="button"
                      onClick={() => eliminarArticulo(art.id_temp)}
                      className="absolute right-3 top-3 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Ej: Zapatos cafés"
                      value={art.producto}
                      onChange={(e) =>
                        actualizarArticulo(
                          art.id_temp,
                          "producto",
                          e.target.value,
                        )
                      }
                      className="flex-1 bg-transparent border-b-2 border-slate-200 focus:border-taller-500 outline-none px-1 py-1 text-sm font-bold text-slate-800 placeholder:font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Wrench
                      className="absolute left-3 top-3 text-slate-400"
                      size={16}
                    />
                    <textarea
                      rows="2"
                      placeholder="Detalle de reparación..."
                      value={art.reparacion}
                      onChange={(e) =>
                        actualizarArticulo(
                          art.id_temp,
                          "reparacion",
                          e.target.value,
                        )
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none bg-white font-medium resize-none"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                      Precio Unitario:
                    </span>
                    <div className="relative w-28">
                      <DollarSign
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        size={14}
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={art.precio}
                        onChange={(e) =>
                          actualizarArticulo(
                            art.id_temp,
                            "precio",
                            e.target.value,
                          )
                        }
                        className="w-full pl-8 pr-3 py-1.5 text-sm border-2 border-slate-200 rounded-lg focus:border-taller-500 outline-none bg-white font-bold text-right"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* FINANZAS Y FECHA */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-slate-800 font-bold text-sm mb-1.5 ml-1">
                  Total Auto-Calculado
                </label>
                <div className="relative bg-indigo-50 border-2 border-indigo-100 rounded-2xl flex items-center px-4 py-2.5">
                  <DollarSign className="text-indigo-500 shrink-0" size={18} />
                  <span className="w-full text-lg font-black text-indigo-800 text-right">
                    {precioTotalCalculado.toFixed(2)}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-slate-800 font-bold text-sm mb-1.5 ml-1">
                  Abono Inicial
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="number"
                    step="0.01"
                    name="abono"
                    placeholder="0.00"
                    value={formulario.abono}
                    onChange={(e) =>
                      setFormulario({ ...formulario, abono: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-lg border-2 border-slate-200 rounded-2xl focus:border-taller-500 outline-none bg-slate-50 font-bold text-slate-800 text-right"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-bold text-sm mb-1.5 ml-1">
                Fecha de Entrega
              </label>
              <button
                type="button"
                onClick={() => setMostrarCalendario(true)}
                className={`w-full flex items-center gap-3 pl-4 pr-4 py-3 text-md border-2 rounded-2xl outline-none font-bold transition-all ${formulario.fecha_entrega_prometida ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                <Calendar
                  size={20}
                  className={
                    formulario.fecha_entrega_prometida
                      ? "text-emerald-500"
                      : "text-slate-400"
                  }
                />
                <span className="capitalize">{fechaFormateada}</span>
              </button>
            </div>
          </div>

          <div className="shrink-0 pt-4 mt-2 border-t border-slate-100">
            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={guardando}
                className={`w-full flex items-center justify-center gap-2 text-white text-lg font-black py-3.5 rounded-2xl transition-all disabled:opacity-70 shadow-lg ${idEdicion ? "bg-indigo-600 hover:bg-indigo-700" : "bg-taller-950 hover:bg-taller-800"}`}
              >
                {guardando ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                {guardando
                  ? "Guardando..."
                  : idEdicion
                    ? "Actualizar Orden"
                    : "Registrar Orden"}
              </button>
              {idEdicion && (
                <button
                  type="button"
                  onClick={onCancelar}
                  className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-bold py-3 rounded-2xl transition-all"
                >
                  <XCircle size={18} /> Cancelar Edición
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default FormularioTrabajo;
