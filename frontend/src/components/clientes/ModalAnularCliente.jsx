import { AlertTriangle } from "lucide-react";

const ModalAnularCliente = ({ cliente, onClose, onConfirm }) => {
  if (!cliente) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-8 md:p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-red-100 text-red-600 rounded-full">
            <AlertTriangle size={40} />
          </div>
          <h3 className="text-3xl font-black text-slate-800">
            ¿Anular cliente?
          </h3>
        </div>

        <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
          Estás a punto de anular el registro de{" "}
          <span className="font-black text-slate-800">
            {cliente.nombre_completo}
          </span>
          . Esta acción no se puede deshacer. ¿Deseas continuar?
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-5 text-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-5 text-xl font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl transition-colors shadow-lg shadow-red-600/30"
          >
            Sí, anular cliente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalAnularCliente;
