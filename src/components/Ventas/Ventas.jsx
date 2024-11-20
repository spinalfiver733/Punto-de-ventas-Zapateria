// Ventas.jsx
import { useState } from 'react';
import RegistrarVenta from './RegistrarVenta';
import HistorialVentas from './HistorialVentas';
import './Ventas.css';
import '../../styles/estilosGenerales.css';

const Ventas = () => {
  const [vistaActual, setVistaActual] = useState('registrar'); // 'registrar' o 'historial'

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
      </div>

      {vistaActual === 'registrar' && (
        <RegistrarVenta />
      )}
      {vistaActual === 'historial' && (
        <HistorialVentas />
      )}
    </div>
  );
};

export default Ventas;