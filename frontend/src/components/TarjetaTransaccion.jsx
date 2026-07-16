import {
  Clock,
  FileText,
  CalendarCheck,
  Banknote,
  CreditCard,
  Download,
} from "lucide-react";

const TarjetaTransaccion = ({ tx, formatearDinero, onDescargarPDF }) => {
  const esEfectivo = tx.metodo_pago === "Efectivo";
  const esAnticipo = tx.es_anticipo;

  return (
    <div
      className={`p-5 border-2 ${esAnticipo ? "border-amber-100 bg-amber-50/30" : "border-slate-100 bg-slate-50"} hover:bg-white hover:border-slate-300 rounded-3xl transition-colors flex flex-col md:flex-row md:items-center justify-between gap-5 group`}
    >
      <div className="flex items-center gap-5 overflow-hidden flex-1">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-2 ${esAnticipo ? "bg-amber-100 border-amber-200 text-amber-600" : "bg-slate-100 border-slate-200 text-slate-500"}`}
        >
          {esAnticipo ? <Clock size={24} /> : <FileText size={24} />}
        </div>

        <div className="overflow-hidden">
          <h4 className="text-2xl font-black text-slate-800 leading-tight mb-1 truncate">
            #{tx.numero_comprobante}
          </h4>
          <p className="text-md text-slate-600 font-medium truncate mb-2">
            Cliente:{" "}
            <span className="font-bold text-slate-800">
              {tx.nombre_completo}
            </span>
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-slate-500 font-bold flex items-center gap-1.5">
              <CalendarCheck size={16} />
              {new Date(tx.fecha_emision).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 border ${esEfectivo ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}
            >
              {esEfectivo ? <Banknote size={14} /> : <CreditCard size={14} />}
              {tx.metodo_pago}
            </span>
            {esAnticipo && (
              <span className="px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-700 border border-amber-200">
                Anticipo Activo
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-row md:flex-col justify-between items-center md:items-end gap-4 shrink-0 border-t md:border-t-0 border-slate-200 pt-4 md:pt-0 mt-2 md:mt-0 min-w-55">
        <div className="text-left md:text-right">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">
            {esAnticipo ? "Abono Recibido" : "Total Cobrado"}
          </p>
          <p className="text-3xl font-black text-slate-800 leading-none">
            {formatearDinero(tx.total)}
          </p>
        </div>

        <div className="flex gap-2 mt-1">
          <button
            onClick={() => onDescargarPDF(tx)}
            className="p-3 text-white bg-slate-800 hover:bg-slate-900 border border-slate-800 rounded-xl transition-colors shadow-md font-bold flex items-center gap-2"
            title="Generar e imprimir PDF"
          >
            <Download size={20} />
            <span className="hidden xl:block text-sm">Descargar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TarjetaTransaccion;
