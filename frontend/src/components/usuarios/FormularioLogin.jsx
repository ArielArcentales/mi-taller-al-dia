import { User, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

const FormularioLogin = ({
  credenciales,
  isLoading,
  errorMsg,
  showPassword,
  onCambio,
  onSubmit,
  onTogglePassword,
  onForgotPassword,
}) => {
  return (
    <div className="w-full h-full flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 xl:px-24 bg-white">
      <div className="mb-10">
        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-black text-taller-950 mb-3 tracking-tight leading-tight">
          Mi Taller <span className="text-taller-500">al Día</span>
        </h2>
        <p className="text-slate-500 text-lg lg:text-xl font-bold">
          Ingresa tus datos para gestionar el taller
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl transition-all shadow-sm">
          <AlertCircle className="shrink-0" size={24} />
          <p className="text-sm font-bold">{errorMsg}</p>
        </div>
      )}

      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <label className="block text-slate-500 font-bold text-sm uppercase tracking-widest mb-2 ml-1">
            Usuario
          </label>
          <div className="relative group">
            <User
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-600 transition-colors"
              size={22}
            />
            <input
              type="text"
              name="usuario"
              value={credenciales.usuario}
              placeholder="Ej: admin"
              disabled={isLoading}
              className="w-full pl-14 pr-5 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:border-taller-500 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-slate-800 font-bold bg-slate-50 disabled:opacity-50"
              onChange={onCambio}
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-500 font-bold text-sm uppercase tracking-widest mb-2 ml-1">
            Contraseña
          </label>
          <div className="relative group">
            <Lock
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-600 transition-colors"
              size={22}
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={credenciales.password}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full pl-14 pr-14 py-4 text-lg border-2 border-slate-200 rounded-2xl focus:border-taller-500 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-slate-800 font-bold bg-slate-50 disabled:opacity-50 tracking-widest"
              onChange={onCambio}
            />

            <button
              type="button"
              onClick={onTogglePassword}
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-taller-600 transition-colors disabled:opacity-50 p-2"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-4 py-2 ml-1">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              disabled={isLoading}
              className="w-5 h-5 rounded border-slate-300 text-taller-600 focus:ring-taller-500 disabled:opacity-50 cursor-pointer"
            />
            <span className="text-slate-500 font-bold text-sm group-hover:text-taller-950 transition-colors">
              Recordarme
            </span>
          </label>
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-taller-600 font-bold text-sm hover:text-taller-800 transition-colors text-right underline underline-offset-4"
          >
            ¿Olvidaste tu clave?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex items-center justify-center gap-3 text-white text-lg font-black py-4 rounded-2xl transition-all mt-6 
            ${
              isLoading
                ? "bg-slate-300 cursor-not-allowed"
                : "bg-taller-600 hover:bg-taller-700 active:scale-[0.98] shadow-[0_15px_30px_-10px_rgba(52,160,164,0.5)]"
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin text-slate-500" size={24} />
              <span className="text-slate-500">Iniciando sesión...</span>
            </>
          ) : (
            <span>Ingresar al Sistema</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default FormularioLogin;
