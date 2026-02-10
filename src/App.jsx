import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import MainLayout from './Layouts/MainLayout';
import { VentaProvider } from './context/VentaContext';
import InventarioPublico from './pages/InventarioPublico'; // nuevo
import './App.css';

function App() {
  return (
    <div className="full-width-container">
      <SnackbarProvider 
        maxSnack={3} 
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
        style={{ marginTop: '65px' }}
        classes={{
          variantSuccess: 'success-snackbar',
          variantError: 'error-snackbar',
          variantWarning: 'warning-snackbar',
          variantInfo: 'info-snackbar',
        }}
      >
        <VentaProvider>

          <Routes>

            {/* APP NORMAL (con sidebar, header, etc) */}
            <Route path="/*" element={<MainLayout />} />

            {/* INVENTARIO SOLO VISTA (sin layout) */}
            <Route path="/inventario" element={<InventarioPublico />} />

          </Routes>

        </VentaProvider>
      </SnackbarProvider>
    </div>
  );
}

export default App;
