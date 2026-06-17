import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import PantallaCarga from "../components/PantallaCarga";
import axios from "axios";
import foto1 from "../assets/images/foto1.png";
import foto2 from "../assets/images/foto2.png";
import foto3 from "../assets/images/foto3.png";

const Login = () => {
  const navigate = useNavigate();

  // Estados de la interfaz
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Estados de control de datos y peticiones
  const [credenciales, setCredenciales] = useState({
    usuario: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const slides = [
    { imagen: foto1, texto: '"Tu negocio de siempre, más fácil que nunca."' },
    {
      imagen: foto2,
      texto: '"Control de inventario y facturación al instante."',
    },
    {
      imagen: foto3,
      texto: '"Calidad en cada puntada, tradición en cada entrega."',
    },
  ];

  // Cambia la imagen del carrusel de forma automática
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1,
      );
    }, 5000);
    return () => clearInterval(timer); // Limpieza del intervalo al desmontar el componente
  }, [slides.length]);

  const manejarCambio = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  // Función Iniciar Sesión
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // Validación si los campos están vacíos
    if (!credenciales.usuario.trim() || !credenciales.password.trim()) {
      setErrorMsg("Por favor, completa tu usuario y contraseña.");
      return;
    }

    setIsLoading(true);

    try {
      // Petición HTTP POST al backend en Node.js
      const respuesta = await axios.post(
        "http://localhost:3000/api/usuarios/login",
        {
          username: credenciales.usuario,
          password: credenciales.password,
        },
      );

      localStorage.setItem("token", respuesta.data.token);
      localStorage.setItem("usuario", JSON.stringify(respuesta.data.usuario));

      setIsLoading(false);
      navigate("/dashboard");
    } catch (error) {
      setIsLoading(false);

      // Manejo de errores
      if (error.response) {
        // Errores controlados por la API
        if (
          error.response.status === 401 ||
          error.response.status === 400 ||
          error.response.status === 404
        ) {
          setErrorMsg(
            error.response.data.mensaje || "Usuario o contraseña incorrectos.",
          );
        } else {
          setErrorMsg(
            "Error interno del servidor. Revisa la consola del backend.",
          );
        }
      } else if (error.request) {
        setErrorMsg("Error al conectar con el servidor");
      } else {
        setErrorMsg("Ocurrió un error inesperado. Inténtalo de nuevo.");
      }
    }
  };

  return (
    <>
      {isLoading && <PantallaCarga texto="Validando credenciales..." />}

      <div className="min-h-screen w-screen flex items-center justify-center p-4 md:p-8 bg-slate-200">
        <div className="bg-white w-full .max-w-[1400px] h-[90vh] .min-h-[700px] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-100">
          <div className="w-full lg:w-[55%] p-8 sm:p-16 xl:p-24 flex flex-col justify-center relative z-10 bg-white">
            <div className="mb-10">
              <h2 className="text-6xl xl:text-7xl font-black text-taller-950 mb-3 tracking-tight">
                Mi Taller al Día
              </h2>
              <p className="text-taller-700 text-2xl font-medium">
                Ingresa tus datos para gestionar el taller
              </p>
            </div>

            {errorMsg && (
              <div className="mb-8 flex items-center gap-4 bg-red-50 border-2 border-red-200 text-red-700 p-5 rounded-2xl transition-all animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="shrink-0" size={32} />
                <p className="text-xl font-bold">{errorMsg}</p>
              </div>
            )}

            <form className="space-y-10" onSubmit={handleSubmit}>
              <div>
                <label className="block text-taller-950 font-black text-lg uppercase tracking-wider mb-3 ml-2">
                  Usuario
                </label>
                <div className="relative group">
                  <User
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-500 transition-colors"
                    size={32}
                  />
                  <input
                    type="text"
                    name="usuario"
                    // Validación en código
                    value={credenciales.usuario}
                    placeholder="Ej: victor_admin"
                    disabled={isLoading}
                    className="w-full pl-16 pr-5 py-6 text-2xl border-2 border-slate-200 rounded-2xl focus:border-taller-800 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-taller-950 font-bold bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onChange={manejarCambio}
                  />
                </div>
              </div>

              <div>
                <label className="block text-taller-950 font-black text-lg uppercase tracking-wider mb-3 ml-2">
                  Contraseña
                </label>
                <div className="relative group">
                  <Lock
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-taller-500 transition-colors"
                    size={32}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    // Validación en código
                    value={credenciales.password}
                    placeholder="••••••••"
                    disabled={isLoading}
                    className="w-full pl-16 pr-16 py-6 text-2xl border-2 border-slate-200 rounded-2xl focus:border-taller-800 focus:ring-4 focus:ring-taller-100 outline-none transition-all text-taller-950 font-bold bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onChange={manejarCambio}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-taller-500 transition-colors disabled:opacity-50 p-2"
                  >
                    {showPassword ? <EyeOff size={32} /> : <Eye size={32} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 ml-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    disabled={isLoading}
                    className="w-6 h-6 rounded border-slate-300 text-taller-500 focus:ring-taller-500 disabled:opacity-50 cursor-pointer"
                  />
                  <span className="text-slate-600 font-bold text-xl group-hover:text-taller-950 transition-colors">
                    Recordarme
                  </span>
                </label>
                <button
                  type="button"
                  className="text-taller-700 font-black text-xl hover:text-taller-950 transition-colors text-left"
                >
                  ¿Olvidaste tu clave?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-4 text-white text-3xl font-black py-6 rounded-2xl transition-all shadow-xl mt-6 
                  ${
                    isLoading
                      ? "bg-taller-800 opacity-80 cursor-not-allowed"
                      : "bg-taller-950 hover:bg-taller-900 active:scale-[0.98] shadow-taller-950/30"
                  }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={36} />
                    <span>Iniciando...</span>
                  </>
                ) : (
                  <span>Iniciar Sesión</span>
                )}
              </button>
            </form>
          </div>

          <div className="hidden lg:flex w-[45%] bg-slate-900 relative overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={slide.imagen}
                  alt={`Slide ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover object-center scale-105"
                />
                <div className="absolute inset-0 .bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent"></div>
                <div className="absolute inset-0 z-10 p-12 xl:p-16 flex flex-col justify-end items-center text-center">
                  <h3 className="text-white text-3xl xl:text-4xl font-dm italic mb-8 leading-tight drop-shadow-xl max-w-lg">
                    {slide.texto}
                  </h3>
                </div>
              </div>
            ))}

            <div className="absolute bottom-10 left-0 right-0 z-20 flex justify-center space-x-3 pointer-events-auto">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-3 rounded-full transition-all duration-500 cursor-pointer shadow-lg ${
                    index === currentSlide
                      ? "w-14 bg-white"
                      : "w-3 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Ir a diapositiva ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
