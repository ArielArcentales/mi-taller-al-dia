import { TrendingUp, DollarSign, Banknote, CreditCard } from "lucide-react";

const ResumenFinanciero = ({
  ingresosTotales,
  totalEfectivo,
  totalTransferencia,
  formatearDinero,
}) => {
  return (
    <div className="shrink-0 bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-500 mb-4 flex items-center gap-2">
        <TrendingUp size={20} className="text-emerald-500" /> Resumen de
        Ingresos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden transition-colors hover:border-slate-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center shrink-0">
              <DollarSign size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              Total Recaudado
            </span>
          </div>
          <p className="text-3xl lg:text-4xl font-black text-slate-800 mt-1">
            {formatearDinero(ingresosTotales)}
          </p>
        </div>

        <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden transition-colors hover:border-emerald-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-emerald-200 text-emerald-800 rounded-xl flex items-center justify-center shrink-0">
              <Banknote size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
              Efectivo Físico
            </span>
          </div>
          <p className="text-3xl lg:text-4xl font-black text-emerald-900 mt-1">
            {formatearDinero(totalEfectivo)}
          </p>
        </div>

        <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex flex-col justify-center relative overflow-hidden transition-colors hover:border-blue-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-200 text-blue-800 rounded-xl flex items-center justify-center shrink-0">
              <CreditCard size={20} />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-blue-700">
              Transferencias
            </span>
          </div>
          <p className="text-3xl lg:text-4xl font-black text-blue-900 mt-1">
            {formatearDinero(totalTransferencia)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumenFinanciero;
