import { X, ShieldAlert } from "lucide-react";

const ModalRecuperarClave = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 p-8 flex flex-col items-center text-center border-b border-slate-100 relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          <div className="w-20 h-20 bg-taller-100 text-taller-950 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <ShieldAlert size={40} />
          </div>
          <h3 className="text-3xl font-black text-slate-800 leading-tight">
            Recuperar Acceso
          </h3>
          <p className="text-slate-500 mt-2 text-lg">Soporte Técnico</p>
        </div>
        <div className="p-8 bg-white space-y-6">
          <p className="text-slate-600 text-center text-lg leading-relaxed">
            Para restablecer tu contraseña de manera segura, ponte en contacto
            con el administrador técnico de la plataforma (
            <span className="font-bold text-slate-800">Ariel Mateo</span>).
          </p>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">
              Canal de Soporte
            </p>
            <p className="text-xl font-black text-taller-950">
              Administrador de Sistemas
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-4 bg-taller-950 hover:bg-taller-900 text-white text-xl font-bold rounded-xl transition-all shadow-lg active:scale-[0.98]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRecuperarClave;
