import { X, Archive, Calendar, Users } from "lucide-react";

const ModalTrabajosAnulados = ({ anulados = [], onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 max-w-2xl w-full shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6 md:p-8 border-b-2 border-slate-50 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-200 text-slate-700 rounded-full">
              <Archive size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">
                Trabajos Anulados
              </h3>
              <p className="text-slate-500 font-medium">
                Historial de órdenes canceladas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors border border-slate-200 shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white">
          {anulados.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-10">
              <Archive size={48} className="text-slate-200" />
              <p className="text-xl font-black text-slate-400">
                No hay trabajos anulados
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {anulados.map((t) => (
                <div
                  key={t.id_trabajo}
                  className="p-5 bg-slate-50 border-l-8 border-slate-400 rounded-2xl shadow-sm border-y border-r border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="overflow-hidden">
                    <p className="text-slate-500 font-bold text-sm mb-1">
                      Orden #{t.id_trabajo}
                    </p>
                    <h4 className="text-xl font-black text-slate-800 leading-tight truncate mb-1">
                      {t.descripcion_producto}
                    </h4>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5 font-medium truncate">
                      <Users size={16} /> {t.nombre_completo}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2 text-slate-500 bg-white px-3 py-2 rounded-xl border border-slate-200">
                    <Calendar size={16} />
                    <span className="text-sm font-bold">
                      {new Date(t.ultima_actualizacion).toLocaleDateString(
                        "es-ES",
                        { day: "2-digit", month: "short", year: "numeric" },
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalTrabajosAnulados;
