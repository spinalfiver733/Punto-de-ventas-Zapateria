// Ventas.jsx
import { useState } from 'react';
import RegistrarVenta from './RegistrarVenta';
import HistorialVentas from './HistorialVentas';
import VentasSinProcesar from './VentasSinProcesar';
import './Ventas.css';
import '../../styles/estilosGenerales.css';

const Ventas = () => {
  const [vistaActual, setVistaActual] = useState('registrar'); // 'registrar', 'historial', 'sinprocesar'

  const cambiarVista = (vista) => {
    setVistaActual(vista);
  };

  return (
    <div className="page-container">
      <div className="headerTitle">
        <h2>VENTAS</h2>
      </div>
      <div className="module-nav">
        <div
          onClick={() => cambiarVista('registrar')}
          className={`nav-item ${vistaActual === 'registrar' ? 'active' : ''}`}
        >
          Registrar Venta
        </div>
        <div
          onClick={() => cambiarVista('historial')}
          className={`nav-item ${vistaActual === 'historial' ? 'active' : ''}`}
        >
          Historial de Ventas
        </div>
        <div
          onClick={() => cambiarVista('sinprocesar')}
          className={`nav-item ${vistaActual === 'sinprocesar' ? 'active' : ''}`}
        >
          Ventas Sin Procesar
        </div>
      </div>

      {vistaActual === 'registrar' && (
        <RegistrarVenta />
      )}
      {vistaActual === 'historial' && (
        <HistorialVentas />
      )}
      {vistaActual === 'sinprocesar' && (
        <VentasSinProcesar />
      )}
    </div>
  );
};

export default Ventas;