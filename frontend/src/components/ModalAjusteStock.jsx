import {
  X,
  ArrowRightLeft,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  FileText,
  Loader2,
  Save,
  AlertCircle,
} from "lucide-react";

const ModalAjusteStock = ({
  modalAjuste,
  setModalAjuste,
  onClose,
  onConfirm,
  guardandoAjuste,
  mensajeModal,
}) => {
  if (!modalAjuste.visible) return null;

  const esEntrada = modalAjuste.tipo === "Entrada";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <ArrowRightLeft className="text-slate-600" size={24} /> Ajustar
              Stock
            </h3>
            <p className="text-slate-500 font-bold mt-1 capitalize">
              {modalAjuste.producto?.nombre}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onConfirm} className="p-6 flex flex-col gap-5">
          {mensajeModal.texto && (
            <div className="flex items-center gap-3 bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl transition-all animate-in fade-in">
              <AlertCircle className="shrink-0" size={24} />
              <p className="text-sm font-bold">{mensajeModal.texto}</p>
            </div>
          )}

          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() =>
                setModalAjuste({ ...modalAjuste, tipo: "Entrada" })
              }
              className={`flex-1 py-3 text-md font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${esEntrada ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <ArrowUpRight size={20} /> Agregar (+)
            </button>
            <button
              type="button"
              onClick={() => setModalAjuste({ ...modalAjuste, tipo: "Salida" })}
              className={`flex-1 py-3 text-md font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${!esEntrada ? "bg-white text-red-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <ArrowDownRight size={20} /> Retirar (-)
            </button>
          </div>

          <div className="flex flex-col gap-1 items-center justify-center p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <span className="text-slate-500 font-bold text-sm">
              Stock Disponible Actual
            </span>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-slate-800">
                {modalAjuste.producto?.cantidad_actual}
              </span>
              <span className="text-sm font-bold text-slate-500 mb-1">
                {modalAjuste.producto?.unidad_medida || "Unidades"}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-sm mb-1.5 ml-1">
              Cantidad a {esEntrada ? "ingresar" : "retirar"}
            </label>
            <div className="relative">
              <Package
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              {/* Sin required */}
              <input
                type="number"
                min="1"
                placeholder="Ej: 5"
                value={modalAjuste.cantidad}
                onChange={(e) =>
                  setModalAjuste({ ...modalAjuste, cantidad: e.target.value })
                }
                className={`w-full pl-12 pr-4 py-3 text-xl font-black border-2 rounded-xl outline-none transition-colors ${esEntrada ? "focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100" : "focus:border-red-500 focus:ring-4 focus:ring-red-100"} border-slate-200`}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold text-sm mb-1.5 ml-1">
              Motivo o Justificación
            </label>
            <div className="relative">
              <FileText
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              {/* Sin required */}
              <input
                type="text"
                placeholder={
                  esEntrada
                    ? "Ej: Compra a proveedor local"
                    : "Ej: Uso en reparación"
                }
                value={modalAjuste.motivo}
                onChange={(e) =>
                  setModalAjuste({ ...modalAjuste, motivo: e.target.value })
                }
                className="w-full pl-12 pr-4 py-3 text-sm font-bold border-2 border-slate-200 rounded-xl focus:border-slate-800 outline-none transition-colors bg-slate-50"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={guardandoAjuste}
              className={`w-full flex items-center justify-center gap-2 text-white text-lg font-black py-4 rounded-2xl transition-all disabled:opacity-70 shadow-lg ${esEntrada ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
            >
              {guardandoAjuste ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <Save size={24} />
              )}
              {guardandoAjuste
                ? "Procesando..."
                : `Confirmar ${modalAjuste.tipo}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAjusteStock;
