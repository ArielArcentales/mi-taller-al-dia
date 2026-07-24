import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import PantallaCarga from "../components/comunes/PantallaCarga";
import FormularioLogin from "../components/usuarios/FormularioLogin";
import ModalRecuperarClave from "../components/usuarios/ModalRecuperarClave";

import foto1 from "../assets/images/foto1.png";
import foto2 from "../assets/images/foto2.png";
import foto3 from "../assets/images/foto3.png";

const Login = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        prevSlide === slides.length - 1 ? 0 : prevSlide + 1,
      );
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const manejarCambio = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!credenciales.usuario.trim() || !credenciales.password.trim()) {
      setErrorMsg("Por favor, completa tu usuario y contraseña.");
      return;
    }

    setIsLoading(true);

    try {
      const respuesta = await axiosClient.post("/usuarios/login", {
        username: credenciales.usuario,
        password: credenciales.password,
      });

      localStorage.setItem("token", respuesta.data.token);
      localStorage.setItem("usuario", JSON.stringify(respuesta.data.usuario));

      setIsLoading(false);
      navigate("/dashboard");
    } catch (error) {
      setIsLoading(false);

      if (error.response) {
        if ([401, 400, 404].includes(error.response.status)) {
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

      {/* Contenedor principal idéntico a la Landing Page */}
      <div className="h-screen w-screen bg-slate-200/80 flex items-center justify-center p-4 md:p-8 font-sans overflow-hidden">
        {/* Tarjeta Central 50/50 idéntica a la Landing Page */}
        <div className="w-full .max-w-[1300px] h-full .max-h-[850px] bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative">
          {/* LADO IZQUIERDO: Formulario (50%) */}
          <div className="w-full lg:w-1/2 h-full flex flex-col justify-center relative z-10 bg-white">
            <FormularioLogin
              credenciales={credenciales}
              isLoading={isLoading}
              errorMsg={errorMsg}
              showPassword={showPassword}
              onCambio={manejarCambio}
              onSubmit={handleSubmit}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onForgotPassword={() => setShowRecoveryModal(true)}
            />
          </div>

          {/* LADO DERECHO: Slider de Imágenes (50%) */}
          <div className="hidden lg:flex w-1/2 bg-taller-950 relative overflow-hidden items-center justify-center">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img
                  src={slide.imagen}
                  alt={`Slide ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover object-center scale-105"
                />

                {/* Filtros corporativos (Reemplazan el azul genérico por tus colores 'taller') */}
                <div className="absolute inset-0 bg-taller-950/30 mix-blend-multiply"></div>
                <div className="absolute inset-0 .bg-gradient-to-t from-taller-950 via-taller-900/60 to-transparent"></div>

                <div className="absolute inset-0 z-20 p-12 xl:p-16 flex flex-col justify-end items-center text-center pb-24">
                  <h3 className="text-white text-3xl xl:text-4xl font-black mb-8 leading-tight drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] max-w-lg">
                    {slide.texto}
                  </h3>
                </div>
              </div>
            ))}

            {/* Controles del Slider */}
            <div className="absolute bottom-12 left-0 right-0 z-30 flex justify-center space-x-3 pointer-events-auto">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer shadow-md ${
                    index === currentSlide
                      ? "w-12 bg-taller-400"
                      : "w-3 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Ir a diapositiva ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showRecoveryModal && (
        <ModalRecuperarClave onClose={() => setShowRecoveryModal(false)} />
      )}
    </>
  );
};

export default Login;
