import {
  X,
  AlertCircle,
  Users,
  FileText,
  Calendar,
  Edit,
  Trash2,
  CheckSquare,
} from "lucide-react";

const ModalDetalleTrabajo = ({
  trabajoDetalle,
  setTrabajoDetalle,
  cambiarEstado,
  iniciarEdicion,
  iniciarAnulacion,
  setTrabajoAEntregar,
  esAtrasado,
}) => {
  if (!trabajoDetalle) return null;

  const cantArticulos = Array.isArray(trabajoDetalle.articulos)
    ? trabajoDetalle.articulos.length
    : 1;

  const formatFecha = (fechaStr) => {
    if (!fechaStr) return "No se especificó fecha";
    const soloFecha = fechaStr.includes("T")
      ? fechaStr.split("T")[0]
      : fechaStr;
    const objetoFecha = new Date(soloFecha + "T12:00:00");
    if (isNaN(objetoFecha.getTime())) return "Fecha inválida";
    return objetoFecha.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 max-w-2xl w-full shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 overflow-hidden">
        <div className="px-8 py-6 border-b-2 border-slate-50 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-taller-100 text-taller-800 flex items-center justify-center text-2xl font-black shrink-0 border-2 border-taller-200">
              {trabajoDetalle.nombre_completo?.charAt(0).toUpperCase() || "C"}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-slate-500 font-bold">
                  Orden #{trabajoDetalle.id_trabajo}
                </span>
                {esAtrasado(
                  trabajoDetalle.fecha_entrega_prometida,
                  trabajoDetalle.estado,
                ) && (
                  <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-black uppercase tracking-wide">
                    <AlertCircle size={14} /> Atrasado
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-black text-slate-800 capitalize leading-tight">
                {cantArticulos > 1
                  ? `${cantArticulos} artículos de ${trabajoDetalle.nombre_completo}`
                  : trabajoDetalle.descripcion_producto}
              </h3>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 font-medium mt-1">
                <Users size={14} /> {trabajoDetalle.nombre_completo}
              </p>
            </div>
          </div>
          <button
            onClick={() => setTrabajoDetalle(null)}
            className="p-3 bg-white hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors border border-slate-200 shadow-sm"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="font-bold text-slate-600 text-lg">
              Estado Actual de la Orden:
            </span>
            <select
              value={trabajoDetalle.estado}
              onChange={(e) =>
                cambiarEstado(trabajoDetalle.id_trabajo, e.target.value)
              }
              disabled={trabajoDetalle.estado === "Entregado"}
              className="w-full sm:w-auto border-2 border-slate-200 rounded-2xl px-5 py-2.5 font-bold text-slate-800 outline-none focus:border-taller-500 disabled:opacity-50 text-md bg-white shadow-sm cursor-pointer"
            >
              <option value="Pendiente">Pendiente</option>
              <option value="En Proceso">En Proceso</option>
              <option value="Listo">Listo</option>
            </select>
          </div>

          <div>
            <h4 className="font-bold text-slate-800 text-md mb-3 flex items-center gap-2">
              <FileText size={18} className="text-taller-500" /> Artículos en la
              Orden
            </h4>
            <div className="space-y-3">
              {trabajoDetalle.articulos.map((art, i) => (
                <div
                  key={i}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-black text-slate-800 text-md capitalize">
                      {art.producto}
                    </span>
                    <span className="font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                      ${parseFloat(art.precio || 0).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">
                    {art.reparacion}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-500 font-bold text-sm">
                  Costo Total:
                </span>
                <p className="text-3xl font-black text-slate-800 leading-none">
                  ${parseFloat(trabajoDetalle.precio || 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-slate-500 font-bold text-sm">
                  Estado del Pago:
                </span>
                {trabajoDetalle.estado === "Entregado" ||
                parseFloat(trabajoDetalle.precio || 0) -
                  parseFloat(trabajoDetalle.abono || 0) <=
                  0 ? (
                  <span className="text-sm text-emerald-600 font-black border border-emerald-200 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-wide">
                    Pagado
                  </span>
                ) : (
                  <span className="text-md text-red-500 font-bold bg-red-50 px-3 py-1 rounded-lg border border-red-100">
                    Saldo: -$
                    {(trabajoDetalle.precio - trabajoDetalle.abono).toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-center">
              <h4 className="font-bold text-slate-500 text-sm mb-3 flex items-center gap-2">
                <Calendar size={18} /> Fecha de Entrega
              </h4>
              <p className="text-xl font-black text-slate-800">
                {formatFecha(trabajoDetalle.fecha_entrega_prometida)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t-2 border-slate-50 bg-white shrink-0 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={() => {
              iniciarEdicion(trabajoDetalle);
              setTrabajoDetalle(null);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-2xl text-sm transition-colors border-2 border-indigo-200"
          >
            <Edit size={18} /> Editar
          </button>
          <button
            onClick={() => {
              iniciarAnulacion(trabajoDetalle);
              setTrabajoDetalle(null);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-700 hover:bg-red-100 font-bold rounded-2xl text-sm transition-colors border-2 border-red-200"
          >
            <Trash2 size={18} /> Anular
          </button>
          <button
            disabled={trabajoDetalle.estado === "Entregado"}
            onClick={() => {
              setTrabajoAEntregar(trabajoDetalle);
              setTrabajoDetalle(null);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-2xl text-md transition-colors disabled:opacity-30 shadow-lg shadow-emerald-600/30"
          >
            <CheckSquare size={18} /> Cobrar y Entregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDetalleTrabajo;
