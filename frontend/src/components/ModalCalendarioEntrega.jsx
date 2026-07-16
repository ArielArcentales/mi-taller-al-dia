import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Lock,
} from "lucide-react";

const ModalCalendarioEntrega = ({
  onClose,
  onSeleccionarFecha,
  fechaActual,
}) => {
  const [fechaVista, setFechaVista] = useState(
    fechaActual ? new Date(fechaActual + "T12:00:00") : new Date(),
  );

  const anio = fechaVista.getFullYear();
  const mes = fechaVista.getMonth();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const primerDiaSemana = new Date(anio, mes, 1).getDay();
  const offsetDias = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;

  const cambiarMes = (incremento) =>
    setFechaVista(new Date(anio, mes + incremento, 1));

  const diasSemana = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const celdasVacias = Array.from({ length: offsetDias });
  const celdasDias = Array.from({ length: diasEnMes }, (_, i) => i + 1);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 md:p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="bg-taller-950 p-6 md:p-8 flex items-center justify-between text-white relative">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <CalendarIcon size={32} className="text-taller-400" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black capitalize tracking-wide">
              {fechaVista.toLocaleString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 md:p-8 bg-slate-50 flex flex-col gap-5 md:gap-6">
          <div className="flex justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <button
              type="button"
              onClick={() => cambiarMes(-1)}
              className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={() => setFechaVista(new Date())}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-black uppercase text-sm tracking-wider transition-colors"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => cambiarMes(1)}
              className="p-3 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="bg-white p-5 md:p-6 .rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="grid grid-cols-7 gap-2 mb-3 md:mb-4">
              {diasSemana.map((dia) => (
                <div
                  key={dia}
                  className={`text-center text-xs md:text-sm font-black uppercase tracking-wider ${dia === "Sáb" ? "text-red-400" : "text-slate-400"}`}
                >
                  {dia}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {celdasVacias.map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="h-12 md:h-14 rounded-xl md:rounded-2xl bg-slate-50/50"
                />
              ))}

              {celdasDias.map((dia) => {
                const fecha = new Date(anio, mes, dia);
                const esHoy = fecha.getTime() === hoy.getTime();
                const esSabado = fecha.getDay() === 6;
                const esPasado = fecha < hoy;

                if (esSabado) {
                  return (
                    <div
                      key={dia}
                      className="h-12 md:h-14 flex flex-col items-center justify-center rounded-xl md:rounded-2xl bg-red-50 text-red-300 font-bold border border-red-100 opacity-70 cursor-not-allowed"
                      title="Sábado (Descanso Adventista)"
                    >
                      <span className="text-sm md:text-base leading-none mb-0.5">
                        {dia}
                      </span>
                      <Lock size={12} />
                    </div>
                  );
                }

                return (
                  <button
                    key={dia}
                    type="button"
                    disabled={esPasado}
                    onClick={() => {
                      const f = new Date(
                        fecha.getTime() - fecha.getTimezoneOffset() * 60000,
                      )
                        .toISOString()
                        .split("T")[0];
                      onSeleccionarFecha(f);
                      onClose();
                    }}
                    className={`h-12 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl text-base md:text-lg font-bold transition-all border-2
                      ${esPasado ? "opacity-30 cursor-not-allowed border-transparent bg-slate-50" : esHoy ? "border-taller-500 bg-taller-50 text-taller-700" : "border-transparent hover:border-slate-300 hover:bg-slate-50 text-slate-700"}
                      active:scale-95`}
                  >
                    {dia}
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

export default ModalCalendarioEntrega;
