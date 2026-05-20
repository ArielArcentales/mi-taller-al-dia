import { Loader2 } from "lucide-react";

const PantallaCarga = ({ texto = "Iniciando Sistema" }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col items-center justify-center transition-all duration-500">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-sm w-[85%] animate-in zoom-in-95 fade-in duration-300">
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute inset-0 bg-taller-500/20 rounded-full blur-2xl animate-pulse"></div>

          <Loader2
            className="animate-spin text-taller-950 relative z-10"
            size={80}
            strokeWidth={2}
          />
        </div>

        <h3 className="text-3xl font-black text-slate-800 tracking-tight text-center mb-3">
          Mi Taller al Día
        </h3>

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-taller-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-taller-600"></span>
          </span>
          <p className="text-slate-600 font-bold text-sm uppercase tracking-widest">
            {texto}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PantallaCarga;
