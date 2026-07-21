import { X, Phone, FileText, Edit, Trash2 } from "lucide-react";

// Misma función de color para mantener la consistencia
const obtenerColorAvatar = (nombre) => {
  const colores = [
    "bg-red-100 text-red-800 border-red-200",
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-emerald-100 text-emerald-800 border-emerald-200",
    "bg-amber-100 text-amber-800 border-amber-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-pink-100 text-pink-800 border-pink-200",
    "bg-teal-100 text-teal-800 border-teal-200",
    "bg-orange-100 text-orange-800 border-orange-200",
  ];
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colores[Math.abs(hash) % colores.length];
};

const ModalDetalleCliente = ({ cliente, onClose, onEditar, onAnular }) => {
  if (!cliente) return null;

  const colorAvatar = obtenerColorAvatar(cliente.nombre_completo || "X");

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col">
        {/* Cabecera del modal */}
        <div className="bg-slate-50 p-8 relative flex flex-col items-center text-center border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>

          <div
            className={`w-24 h-24 border-4 border-white shadow-lg rounded-full flex items-center justify-center text-4xl font-black mb-4 ${colorAvatar}`}
          >
            {cliente.nombre_completo.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-3xl font-black text-slate-800 capitalize leading-tight">
            {cliente.nombre_completo}
          </h3>
        </div>

        {/* Cuerpo del modal */}
        <div className="p-8 bg-white flex flex-col gap-6">
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="p-3 bg-white rounded-xl shadow-sm text-slate-500">
              <Phone size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Teléfono / Celular
              </p>
              <p className="text-xl font-black text-slate-700">
                {cliente.telefono}
              </p>
            </div>
          </div>

          {cliente.notas && (
            <div className="flex items-start gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
              <div className="p-3 bg-white rounded-xl shadow-sm text-amber-500 shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-600/70 uppercase tracking-wider mb-1">
                  Notas del Cliente
                </p>
                <p className="text-lg font-medium text-slate-700 leading-relaxed">
                  {cliente.notas}
                </p>
              </div>
            </div>
          )}

          {/* Botones de acción directos en la tarjeta */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => {
                onEditar(cliente);
                onClose();
              }}
              className="flex-1 py-4 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-2xl transition-colors border border-indigo-100"
            >
              <Edit size={20} /> Editar
            </button>
            <button
              onClick={() => {
                onAnular(cliente);
                onClose();
              }}
              className="flex-1 py-4 flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-2xl transition-colors border border-red-100"
            >
              <Trash2 size={20} /> Anular
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleCliente;
