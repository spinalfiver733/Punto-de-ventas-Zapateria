import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomNotistack from './notificaciones/CustomNotistack';
import MainLayout from './Layouts/MainLayout';
import { VentaProvider } from './context/VentaContext';
import InventarioPublico from './pages/InventarioPublico';
import VentasPage from './pages/VentasPage';
import HomeMenu from './pages/HomeMenu'; 
import './App.css';

function App() {
  return (
    <div className="full-width-container">
      <CustomNotistack>
        <VentaProvider>

          <Routes>
            {/* PÁGINA DE BIENVENIDA*/}
            <Route path="/" element={<HomeMenu />} />

            {/* APP NORMAL */}
            <Route path="/app/*" element={<MainLayout />} />

            {/* INVENTARIO SOLO VISTA */}
            <Route path="/inventario" element={<InventarioPublico />} />

            {/* PÁGINA VENTAS DEL DÍA */}
            <Route path="/ventas_dia" element={<VentasPage />} />
          </Routes>

        </VentaProvider>
      </CustomNotistack>
    </div>
  );
}

export default App;