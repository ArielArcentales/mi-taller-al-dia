import {
  X,
  History,
  Loader2,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";

const ModalHistorialInventario = ({
  producto,
  historial,
  cargandoHistorial,
  onClose,
}) => {
  if (!producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
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
                {producto.nombre}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
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
                        <p className="font-black text-slate-800 text-xl">
                          {esEntrada ? "Entrada" : "Salida"} de Stock
                        </p>
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
  );
};

export default ModalHistorialInventario;
