// Configuracion.jsx
import { useState } from 'react';
import AgregarEmpleado from './AgregarEmpleado';
import EstadoVendedores from './EstadoVendedores';
import './Configuracion.css';
import '../../styles/estilosGenerales.css';

const Configuracion = () => {
  const [vistaActual, setVistaActual] = useState('agregar'); // 'agregar' o 'estado'

  const cambiarVista = (vista) => {
    setVistaActual(vista);
  };

  return (
    <div className="page-container">
      <div className="headerTitle">
        <h2>CONFIGURACIÓN</h2>
      </div>
      <div className="module-nav">
        <div 
          onClick={() => cambiarVista('agregar')}
          className={`nav-item ${vistaActual === 'agregar' ? 'active' : ''}`}
        >
          Agregar Empleado
        </div>
        <div 
          onClick={() => cambiarVista('estado')}
          className={`nav-item ${vistaActual === 'estado' ? 'active' : ''}`}
        >
          Estado Vendedores
        </div>
      </div>

      {vistaActual === 'agregar' && <AgregarEmpleado />}
      {vistaActual === 'estado' && <EstadoVendedores />}
    </div>
  );
};

export default Configuracion;

