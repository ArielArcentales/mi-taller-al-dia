import {
  User,
  Phone,
  FileText,
  Save,
  Loader2,
  Edit,
  Plus,
  XCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const FormularioCliente = ({
  datosFormulario,
  modoEdicion,
  guardando,
  mensaje,
  onCambio,
  onGuardar,
  onCancelar,
}) => {
  return (
    <div className="xl:col-span-5 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col h-full">
      <header className="shrink-0 mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-4 rounded-2xl ${modoEdicion ? "bg-indigo-100 text-indigo-700" : "bg-taller-100 text-taller-700"}`}
          >
            {modoEdicion ? <Edit size={32} /> : <Plus size={32} />}
          </div>
          <h3 className="text-3xl font-black text-slate-800">
            {modoEdicion ? "Editar Cliente" : "Nuevo Cliente"}
          </h3>
        </div>
      </header>

      {/* Contenedor principal sin scroll, usando Flexbox para distribuir el espacio */}
      <div className="flex-1 flex flex-col justify-between">
        {mensaje.texto && (
          <div
            className={`mb-4 flex items-center gap-3 border-2 p-4 rounded-2xl transition-all animate-in fade-in 
            ${mensaje.tipo === "exito" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}
          >
            {mensaje.tipo === "exito" ? (
              <CheckCircle2 className="shrink-0" size={28} />
            ) : (
              <AlertCircle className="shrink-0" size={28} />
            )}
            <p className="text-md font-bold">{mensaje.texto}</p>
          </div>
        )}

        <form
          onSubmit={onGuardar}
          className="flex flex-col gap-5 flex-1 justify-center"
        >
          <div>
            <label className="block text-slate-800 font-bold text-md mb-2 ml-1">
              Nombre Completo
            </label>
            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-500 transition-colors"
                size={20}
              />
              <input
                type="text"
                name="nombre_completo"
                value={datosFormulario.nombre_completo}
                onChange={onCambio}
                placeholder="Ej: María Pérez"
                className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-2xl focus:border-taller-800 outline-none transition-all text-slate-800 font-bold bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold text-md mb-2 ml-1">
              Teléfono o Celular
            </label>
            <div className="relative group">
              <Phone
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-500 transition-colors"
                size={20}
              />
              <input
                type="text"
                name="telefono"
                value={datosFormulario.telefono}
                onChange={onCambio}
                placeholder="Ej: 0991234567"
                className="w-full pl-12 pr-4 py-3 text-lg border-2 border-slate-200 rounded-2xl focus:border-taller-800 outline-none transition-all text-slate-800 font-bold bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-800 font-bold text-md mb-2 ml-1">
              Notas (Opcional)
            </label>
            <div className="relative group">
              <FileText
                className="absolute left-4 top-4 text-slate-400 group-focus-within:text-taller-500 transition-colors"
                size={20}
              />
              <textarea
                name="notas"
                rows="3"
                value={datosFormulario.notas}
                onChange={onCambio}
                placeholder="Ej: Cliente frecuente..."
                className="w-full pl-12 pr-4 py-3 text-md border-2 border-slate-200 rounded-2xl focus:border-taller-800 outline-none transition-all text-slate-800 font-medium bg-slate-50 resize-none"
              ></textarea>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-2">
            <button
              type="submit"
              disabled={guardando}
              className={`w-full flex items-center justify-center gap-3 text-white text-lg font-black py-4 rounded-2xl transition-all disabled:opacity-70 shadow-lg
                ${modoEdicion ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30" : "bg-taller-950 hover:bg-taller-800 shadow-taller-950/30"}`}
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
                    {modoEdicion ? "Actualizar Cliente" : "Registrar Cliente"}
                  </span>
                </>
              )}
            </button>

            {modoEdicion && (
              <button
                type="button"
                onClick={onCancelar}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-md font-bold py-3 rounded-2xl transition-all"
              >
                <XCircle size={20} /> Cancelar Edición
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormularioCliente;
