import { Archive } from "lucide-react";

const ModalArchivarMaterial = ({ producto, onClose, onConfirm }) => {
  if (!producto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-4xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-50 p-8 flex flex-col items-center text-center border-b border-slate-100">
          <div className="w-20 h-20 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center mb-5 shadow-sm">
            <Archive size={36} />
          </div>
          <h3 className="text-3xl font-black text-slate-800">
            ¿Archivar Material?
          </h3>
          <p className="text-slate-600 mt-3 text-lg font-medium leading-snug">
            Se ocultará{" "}
            <span className="font-black text-slate-800">{producto.nombre}</span>{" "}
            del catálogo activo.
          </p>
        </div>
        <div className="p-8 bg-white">
          <p className="text-slate-500 text-center text-sm font-bold mb-8">
            Esta acción no elimina el historial de movimientos asociados a este
            material, manteniendo segura la auditoría.
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-lg font-bold rounded-2xl transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-4 bg-slate-800 hover:bg-slate-900 text-white text-lg font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <Archive size={20} /> Archivar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalArchivarMaterial;
