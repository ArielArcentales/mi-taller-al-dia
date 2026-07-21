import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import DashboardLayout from "./components/comunes/DashboardLayout";
import DashboardInicio from "./pages/DashboardInicio";
import Clientes from "./pages/Clientes";
import Trabajos from "./pages/Trabajos";
import Inventario from "./pages/Inventario";
import Finanzas from "./pages/Finanzas";
import GestionUsuarios from "./pages/GestionUsuarios";
import ProtectedRoute from "./components/comunes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />

      {/* Rutas Privadas*/}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Vista por defecto al entrar a /dashboard */}
        <Route index element={<DashboardInicio />} />

        {/* Ruta de los módulos */}
        <Route path="clientes" element={<Clientes />} />
        <Route path="trabajos" element={<Trabajos />} />
        <Route path="inventario" element={<Inventario />} />
        <Route path="finanzas" element={<Finanzas />} />

        {/* 2. AGREGAMOS LA RUTA PARA EL SUPERADMIN */}
        <Route path="usuarios" element={<GestionUsuarios />} />
      </Route>

      {/* Ruta 404: Si escriben una URL que no existe, los manda al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
