import { useState } from "react";
import {
  Tag,
  Layers,
  ChevronDown,
  Ruler,
  Package,
  AlertTriangle,
  DollarSign,
  Loader2,
  Save,
  Edit2,
  AlertCircle,
  X,
  CheckCircle2,
} from "lucide-react";

const FormularioInventario = ({
  formulario,
  setFormulario,
  idEdicion,
  guardando,
  mensaje,
  onGuardar,
  onCancelar,
  categoriasTaller,
  unidadesMedida,
}) => {
  const [showCatForm, setShowCatForm] = useState(false);
  const [showUnidadForm, setShowUnidadForm] = useState(false);

  return (
    <div
      className={`xl:col-span-1 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border-2 flex flex-col h-full min-h-0 ${idEdicion ? "bg-blue-50/40 border-blue-200" : "border-slate-100"}`}
    >
      <header className="flex items-center justify-between mb-5 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${idEdicion ? "bg-blue-200 text-blue-700" : "bg-taller-100 text-taller-700"}`}
          >
            {idEdicion ? <Edit2 size={24} /> : <Package size={24} />}
          </div>
          <h3 className="text-2xl font-black text-slate-800">
            {idEdicion ? `Editar Material` : "Nuevo Material"}
          </h3>
        </div>
        {idEdicion && (
          <button
            type="button"
            onClick={onCancelar}
            className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </header>

      {/* Contenedor sin scroll (estático) distribuido con Flexbox */}
      <div className="flex-1 flex flex-col justify-between">
        {/* Alertas personalizadas estilo Clientes */}
        {mensaje.texto && (
          <div
            className={`mb-4 flex items-center gap-3 border-2 p-4 rounded-xl transition-all animate-in fade-in 
            ${mensaje.tipo === "exito" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}
          >
            {mensaje.tipo === "exito" ? (
              <CheckCircle2 className="shrink-0" size={24} />
            ) : (
              <AlertCircle className="shrink-0" size={24} />
            )}
            <p className="text-sm font-bold">{mensaje.texto}</p>
          </div>
        )}

        {/* Sin la etiqueta 'required' en los inputs */}
        <form
          onSubmit={onGuardar}
          className="flex flex-col gap-4 flex-1 justify-center"
        >
          <div>
            <label className="block text-slate-800 font-bold text-sm mb-1.5 ml-1">
              Nombre del Material
            </label>
            <div className="relative">
              <Tag
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                name="nombre"
                disabled={idEdicion}
                placeholder="Ej: Suela de goma negra"
                value={formulario.nombre}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    [e.target.name]: e.target.value,
                  })
                }
                className="w-full pl-11 pr-4 py-3 text-md border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none disabled:opacity-50 disabled:bg-slate-100 bg-slate-50 font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-800 font-bold text-sm mb-1.5 ml-1">
                Categoría
              </label>
              <div className="relative">
                <button
                  type="button"
                  disabled={idEdicion}
                  onClick={() => {
                    setShowCatForm(!showCatForm);
                    setShowUnidadForm(false);
                  }}
                  className="w-full pl-10 pr-3 py-3 text-sm border-2 border-slate-200 rounded-xl outline-none text-left font-bold bg-slate-50 flex items-center justify-between disabled:opacity-50 disabled:bg-slate-100"
                >
                  <span className="flex items-center gap-2 truncate text-slate-700">
                    <Layers className="text-slate-400 shrink-0" size={16} />
                    <span className="truncate">
                      {formulario.categoria || "Seleccionar"}
                    </span>
                  </span>
                  <ChevronDown size={16} className="text-slate-400 shrink-0" />
                </button>
                {showCatForm && !idEdicion && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 flex flex-col max-h-40 overflow-y-auto custom-scrollbar">
                    {categoriasTaller.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          setFormulario({ ...formulario, categoria: cat });
                          setShowCatForm(false);
                        }}
                        className="w-full p-2.5 hover:bg-slate-50 text-left font-bold text-slate-700 text-xs border-b border-slate-50 last:border-0"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-slate-800 font-bold text-sm mb-1.5 ml-1">
                Medida
              </label>
              <div className="relative">
                <button
                  type="button"
                  disabled={idEdicion}
                  onClick={() => {
                    setShowUnidadForm(!showUnidadForm);
                    setShowCatForm(false);
                  }}
                  className="w-full pl-10 pr-3 py-3 text-sm border-2 border-slate-200 rounded-xl outline-none text-left font-bold bg-slate-50 flex items-center justify-between disabled:opacity-50 disabled:bg-slate-100"
                >
                  <span className="flex items-center gap-2 truncate text-slate-700">
                    <Ruler className="text-slate-400 shrink-0" size={16} />
                    <span className="truncate">{formulario.unidad_medida}</span>
                  </span>
                  <ChevronDown size={16} className="text-slate-400 shrink-0" />
                </button>
                {showUnidadForm && !idEdicion && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 flex flex-col max-h-40 overflow-y-auto custom-scrollbar">
                    {unidadesMedida.map((uni) => (
                      <button
                        key={uni}
                        type="button"
                        onClick={() => {
                          setFormulario({ ...formulario, unidad_medida: uni });
                          setShowUnidadForm(false);
                        }}
                        className="w-full p-2.5 hover:bg-slate-50 text-left font-bold text-slate-700 text-xs border-b border-slate-50 last:border-0"
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
              <label className="block text-slate-800 font-bold text-sm mb-1.5 ml-1">
                Cantidad
              </label>
              <div className="relative">
                <Package
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="number"
                  name="cantidad_actual"
                  min="0"
                  placeholder="0"
                  disabled={idEdicion}
                  value={formulario.cantidad_actual}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      cantidad_actual: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 text-md font-bold border-2 rounded-xl outline-none bg-slate-50 text-slate-700 border-slate-200 focus:border-taller-500 disabled:opacity-50 disabled:bg-slate-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-800 font-bold text-sm mb-1.5 ml-1">
                Mínimo
              </label>
              <div className="relative">
                <AlertTriangle
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="number"
                  name="stock_minimo"
                  min="0"
                  placeholder="5"
                  value={formulario.stock_minimo}
                  onChange={(e) =>
                    setFormulario({
                      ...formulario,
                      stock_minimo: e.target.value,
                    })
                  }
                  className="w-full pl-10 pr-4 py-3 text-md border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none bg-slate-50 font-bold text-slate-700"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold text-sm mb-1.5 ml-1">
              Costo Unitario
            </label>
            <div className="relative">
              <DollarSign
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="number"
                name="precio_costo"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formulario.precio_costo}
                onChange={(e) =>
                  setFormulario({ ...formulario, precio_costo: e.target.value })
                }
                className="w-full pl-10 pr-4 py-3 text-md border-2 border-slate-200 rounded-xl focus:border-taller-500 outline-none bg-slate-50 font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={guardando}
              className={`w-full flex items-center justify-center gap-2 text-white text-md font-black py-4 rounded-xl transition-all disabled:opacity-70 shadow-lg ${idEdicion ? "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30" : "bg-taller-950 hover:bg-taller-800 shadow-taller-950/30"}`}
            >
              {guardando ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
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
    </div>
  );
};

export default FormularioInventario;
