import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Devoluciones.css';
import RegistrarDevolucion from './RegistrarDevolucion';
import HistorialDevolucion from './HistorialDevolucion';
import SaldosDevoluciones from './SaldosDevoluciones';
import '../../styles/estilosGenerales.css';

const Devoluciones = () => {
  const [vistaActual, setVistaActual] = useState('registrar'); // 'registrar', 'historial' o 'saldos'
  const [devoluciones, setDevoluciones] = useState([]);

  const fetchDevoluciones = useCallback(async () => {
    try {
      const response = await axios.get('/api/devoluciones');
      console.log(response);
      setDevoluciones(response.data);
    } catch (error) {
      console.error('Error fetching devoluciones:', error);
    }
  }, []);

  useEffect(() => {
    if (vistaActual === 'historial') {
      fetchDevoluciones();
    }
  }, [vistaActual, fetchDevoluciones]);

  const cambiarVista = (vista) => {
    setVistaActual(vista);
  };

  return (
    <div className="page-container">
      <div className="headerTitle">
        <h2>DEVOLUCIONES</h2>
      </div>
      <div className="module-nav">
        <div 
          onClick={() => cambiarVista('registrar')}
          className={`nav-item ${vistaActual === 'registrar' ? 'active' : ''}`}
        >
          Registrar Devolución
        </div>
        <div 
          onClick={() => cambiarVista('historial')}
          className={`nav-item ${vistaActual === 'historial' ? 'active' : ''}`}
        >
          Historial de Devoluciones
        </div>
        <div 
          onClick={() => cambiarVista('saldos')}
          className={`nav-item ${vistaActual === 'saldos' ? 'active' : ''}`}
        >
          Saldos a Favor
        </div>
      </div>

      {vistaActual === 'registrar' && (
        <RegistrarDevolucion onDevolucionRegistrada={fetchDevoluciones} />
      )}
      {vistaActual === 'historial' && (
        <HistorialDevolucion devoluciones={devoluciones} />
      )}
      {vistaActual === 'saldos' && (
        <SaldosDevoluciones />
      )}
    </div>
  );
};

export default Devoluciones;
