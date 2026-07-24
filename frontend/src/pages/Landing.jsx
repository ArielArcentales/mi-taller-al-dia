import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Package,
  Wrench,
  Banknote,
  CheckCircle2,
  LayoutDashboard,
  Users,
  DollarSign,
  Home,
  CreditCard,
  ReceiptText,
} from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    /* Contenedor principal: Fondo gris igual al del Login, bloqueado sin scroll */
    <div className="h-screen w-screen bg-slate-200/80 flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
      {/* Tarjeta Central (Imita la estructura de tu Login) */}
      <div className="w-full .max-w-[1300px] h-full .max-h-[850px] bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative">
        {/* =========================================
            LADO IZQUIERDO: TEXTOS Y BOTÓN
        ========================================= */}
        <div className="w-full lg:w-1/2 h-full flex flex-col justify-center p-10 md:p-16 lg:p-20 relative z-10 bg-white">
          {/* Etiqueta superior */}
          <div className="flex items-center gap-4 mb-8">
            <span className="bg-taller-950 text-white px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-md">
              Mi Taller al Día
            </span>
            <span className="text-slate-400 text-sm font-bold tracking-wide">
              Versión 1.0
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-5xl lg:text-[4.5rem] font-black leading-[1.05] tracking-tight mb-8">
            <span className="block text-taller-500">Control Total</span>
            <span className="block text-taller-950">de tu taller.</span>
          </h1>

          {/* Caja descriptiva */}
          <div className="flex items-center gap-5 mb-12 max-w-md bg-white p-5 rounded-3xl shadow-sm border-2 border-slate-100">
            <div className="bg-taller-50 p-4 rounded-2xl shrink-0">
              <Package size={28} className="text-taller-600" />
            </div>
            <p className="text-slate-500 font-bold text-sm leading-relaxed">
              Te guiamos para digitalizar tus órdenes, controlar tu inventario y
              dominar tus finanzas.
            </p>
          </div>

          {/* EL ÚNICO BOTÓN */}
          <button
            onClick={() => navigate("/login")}
            className="w-fit bg-taller-600 hover:bg-taller-700 text-white font-black text-lg md:text-xl px-10 py-5 rounded-2xl shadow-[0_20px_40px_-15px_rgba(52,160,164,0.5)] transition-all flex items-center gap-4 active:scale-95 group"
          >
            Ingresar al sistema
            <ArrowRight
              size={24}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>

        {/* =========================================
            LADO DERECHO: ARTE (TABLET CLON DE LA APP)
        ========================================= */}
        <div className="hidden lg:flex w-1/2 h-full bg-taller-400 relative overflow-hidden items-center justify-center">
          {/* Fondo decorativo (círculos sutiles) */}
          <div className="absolute top-[-10%] right-[-10%] .w-[500px] .h-[500px] bg-taller-300/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] .w-[400px] .h-[400px] bg-taller-500/40 rounded-full blur-3xl"></div>

          {/* Píldoras Flotantes */}
          <div className="absolute top-16 right-16 bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl text-white font-black text-lg rotate-[4deg] shadow-xl z-20">
            Nuevo trabajo +$25.00
          </div>
          <div className="absolute top-36 left-12 bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl text-white font-black text-lg rotate-[-5deg] shadow-xl z-20">
            Abono +$10.00
          </div>
          <div className="absolute top-28 right-40 bg-white/20 backdrop-blur-md border border-white/30 px-5 py-2.5 rounded-2xl text-white font-black text-sm .rotate-[2deg] shadow-xl z-20 opacity-80 scale-90">
            Inventario +12
          </div>

          {/* Tarjeta flotante de orden completada */}
          <div className="absolute bottom-32 left-8 bg-white p-5 rounded-3xl shadow-2xl rotate-[-8deg] border border-slate-50 z-30 animate-in slide-in-from-left-10 duration-1000">
            <div className="flex justify-between items-start mb-3 gap-8">
              <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600">
                <Wrench size={20} />
              </div>
              <span className="text-xs font-black text-slate-300">
                #ORD-042
              </span>
            </div>
            <p className="font-black text-taller-950 text-base mb-1">
              Cambio de suela
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm font-bold text-taller-500">
              <CheckCircle2 size={16} /> Completado
            </div>
          </div>

          {/* =========================================
              MOCKUP DE LA TABLET (CLON EXACTO DE LA APP)
          ========================================= */}
          <div className="absolute w-[130%] .aspect-[4/3] .max-w-[1000px] bg-slate-100 rounded-[2.5rem] .border-[14px] border-slate-900 shadow-[0_30px_60px_rgba(0,0,0,0.5)] rotate-[-8deg] translate-x-24 translate-y-28 flex overflow-hidden z-10">
            {/* Brillo de la pantalla */}
            <div className="absolute inset-0 .bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none z-50"></div>

            {/* CLON: Sidebar (Modo colapsado oscuro) */}
            <div className="w-20 bg-slate-900 h-full flex flex-col items-center py-6 gap-6 border-r border-slate-800 shrink-0">
              {/* Botón Home */}
              <div className="w-12 h-12 bg-slate-800/60 rounded-[14px] border border-slate-700/50 flex items-center justify-center text-indigo-400 mb-2">
                <Home size={22} />
              </div>
              {/* Avatar Ariel */}
              <div className="w-11 h-11 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg mb-4 shadow-lg shadow-indigo-500/30">
                A
              </div>
              {/* Navegación Activa (Dashboard) */}
              <div className="w-full flex justify-center relative group">
                <div className="absolute left-0 top-1 bottom-1 w-1 bg-indigo-500 rounded-r-md"></div>
                <div className="w-12 h-12 bg-slate-800/80 rounded-xl flex items-center justify-center text-indigo-400">
                  <LayoutDashboard size={22} />
                </div>
              </div>
              {/* Navegación Inactiva */}
              <div className="w-12 h-12 flex items-center justify-center text-slate-500">
                <Users size={22} />
              </div>
              <div className="w-12 h-12 flex items-center justify-center text-slate-500">
                <Wrench size={22} />
              </div>
              <div className="w-12 h-12 flex items-center justify-center text-slate-500">
                <Package size={22} />
              </div>
              <div className="w-12 h-12 flex items-center justify-center text-slate-500">
                <DollarSign size={22} />
              </div>
            </div>

            {/* CLON: Área de Contenido Central */}
            <div className="flex-1 bg-slate-100 flex flex-col p-8 gap-6 overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-black text-slate-800">
                    Dashboard General
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">
                    Control de métricas y movimientos recientes
                  </p>
                </div>
                {/* Botones de filtro de tiempo */}
                <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                  <div className="px-5 py-2 bg-taller-900 text-white rounded-lg text-xs font-black tracking-wide">
                    HOY
                  </div>
                  <div className="px-5 py-2 text-slate-500 text-xs font-black tracking-wide">
                    ESTA SEMANA
                  </div>
                </div>
              </div>

              {/* CLON: Tarjetas de Resumen (3 Columnas) */}
              <div className="grid grid-cols-3 gap-5 shrink-0 mt-2">
                <div className="bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 flex flex-col justify-center shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center">
                      <DollarSign size={18} />
                    </div>
                    <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                      Total Recaudado
                    </span>
                  </div>
                  <p className="text-3xl font-black text-slate-800">$245.50</p>
                </div>

                <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 flex flex-col justify-center shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-emerald-200 text-emerald-800 rounded-xl flex items-center justify-center">
                      <Banknote size={18} />
                    </div>
                    <span className="text-[11px] font-black uppercase text-emerald-700 tracking-wider">
                      Efectivo Físico
                    </span>
                  </div>
                  <p className="text-3xl font-black text-emerald-900">
                    $180.00
                  </p>
                </div>

                <div className="bg-blue-50 border-2 border-blue-100 rounded-2xl p-4 flex flex-col justify-center shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 bg-blue-200 text-blue-800 rounded-xl flex items-center justify-center">
                      <CreditCard size={18} />
                    </div>
                    <span className="text-[11px] font-black uppercase text-blue-700 tracking-wider">
                      Transferencias
                    </span>
                  </div>
                  <p className="text-3xl font-black text-blue-900">$65.50</p>
                </div>
              </div>

              {/* CLON: Contenedor Inferior (Libro Mayor / Lista) */}
              <div className="flex-1 bg-white .rounded-[2rem] shadow-sm border border-slate-200 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                    <ReceiptText size={24} className="text-taller-600" />{" "}
                    Movimientos Recientes
                  </h3>
                </div>
                {/* Simulador de listado de transacciones */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="w-full h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center px-4 gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                    <div className="flex-1 h-3 bg-slate-200 rounded-full w-1/3"></div>
                    <div className="w-16 h-6 bg-emerald-100 rounded-md"></div>
                  </div>
                  <div className="w-full h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center px-4 gap-4 opacity-70">
                    <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                    <div className="flex-1 h-3 bg-slate-200 rounded-full w-1/4"></div>
                    <div className="w-16 h-6 bg-blue-100 rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* FIN DEL MOCKUP */}
        </div>
      </div>
    </div>
  );
};

export default Landing;
