import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";

const ModalCalendarioFinanzas = ({
  onClose,
  onSeleccionarFecha,
  transacciones,
}) => {
  const [fechaVista, setFechaVista] = useState(new Date());

  // Configuración del mes actual
  const anio = fechaVista.getFullYear();
  const mes = fechaVista.getMonth();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const primerDiaSemana = new Date(anio, mes, 1).getDay(); // 0 = Domingo

  // Ajuste para que la semana empiece en Lunes (0 = Lunes, 6 = Domingo)
  const offsetDias = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

  // Pre-calculamos qué días tienen transacciones (respetando el corte a las 21:00)
  const diasConTransacciones = new Set();
  transacciones.forEach((tx) => {
    const dTx = new Date(tx.fecha_emision);
    if (dTx.getHours() >= 21) dTx.setDate(dTx.getDate() + 1);
    dTx.setHours(0, 0, 0, 0);
    diasConTransacciones.add(dTx.getTime());
  });

  const cambiarMes = (incremento) => {
    setFechaVista(new Date(anio, mes + incremento, 1));
  };

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const celdasVacias = Array.from({ length: offsetDias });
  const celdasDias = Array.from({ length: diasEnMes }, (_, i) => i + 1);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Cabecera del Calendario */}
        <div className="bg-slate-950 p-6 md:p-8 flex items-center justify-between text-white relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <CalendarIcon size={32} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-3xl font-black capitalize tracking-wide">
                {fechaVista.toLocaleString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <p className="text-slate-400 font-medium mt-1">
                Selecciona un día para ver su libro mayor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute right-6 top-6 p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Controles de Navegación */}
        <div className="p-6 md:p-8 bg-slate-50 flex flex-col gap-6">
          <div className="flex justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <button
              onClick={() => cambiarMes(-1)}
              className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors flex items-center gap-2 font-bold"
            >
              <ChevronLeft size={20} /> Anterior
            </button>
            <button
              onClick={() => setFechaVista(new Date())}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black uppercase text-sm tracking-wider transition-colors"
            >
              Ir a Hoy
            </button>
            <button
              onClick={() => cambiarMes(1)}
              className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors flex items-center gap-2 font-bold"
            >
              Siguiente <ChevronRight size={20} />
            </button>
          </div>

          {/* Cuadrícula del Calendario */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="grid grid-cols-7 gap-2 mb-4">
              {diasSemana.map((dia) => (
                <div
                  key={dia}
                  className="text-center text-xs font-black text-slate-400 uppercase tracking-wider"
                >
                  {dia}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {celdasVacias.map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="h-14 md:h-16 rounded-2xl bg-slate-50/50"
                />
              ))}

              {celdasDias.map((dia) => {
                const fechaActual = new Date(anio, mes, dia);
                const esHoy = fechaActual.getTime() === hoy.getTime();
                const tieneMovimientos = diasConTransacciones.has(
                  fechaActual.getTime(),
                );

                return (
                  <button
                    key={dia}
                    onClick={() => onSeleccionarFecha(fechaActual)}
                    className={`relative h-14 md:h-16 flex flex-col items-center justify-center rounded-2xl text-xl font-bold transition-all border-2
                      ${esHoy ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-transparent hover:border-slate-300 hover:bg-slate-50 text-slate-700"}
                      active:scale-95`}
                  >
                    <span>{dia}</span>
                    {/* Punto indicador de transacciones */}
                    {tieneMovimientos && (
                      <span
                        className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${esHoy ? "bg-emerald-500" : "bg-emerald-400"}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalCalendarioFinanzas;
