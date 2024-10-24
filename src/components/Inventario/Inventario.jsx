import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Inventario.css';
import InventarioLista from './InventarioLista';
import AgregarInventario from './AgregarInventario';
import  '../../styles/estilosGenerales.css';

const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [vistaActual, setVistaActual] = useState('agregar'); // 'lista' o 'agregar'

  const fetchInventario = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventario');
      setInventario(response.data);
    } catch (error) {
      console.log('Error fetching inventario:', error);
    }
  }, []);

  useEffect(() => {
    fetchInventario();
  }, [fetchInventario]);

  const cambiarVista = (vista) => {
    setVistaActual(vista);
    if (vista === 'lista') {
      fetchInventario();
    }
  };

  return (
    <div className="page-container">
      <div className="headerTitle">
        <h2>INVENTARIO</h2>
      </div>
      <div className="inventario-nav">
        <div 
          onClick={() => cambiarVista('agregar')}
          className={`nav-item ${vistaActual === 'agregar' ? 'active' : ''}`}
        >
          Agregar al Inventario
        </div>
        <div 
          onClick={() => cambiarVista('lista')}
          className={`nav-item ${vistaActual === 'lista' ? 'active' : ''}`}
        >
          Ver Inventario
        </div>
      </div>
      {vistaActual === 'lista' ? (
        <InventarioLista inventario={inventario} />
      ) : (
        <AgregarInventario onProductoAgregado={fetchInventario} />
      )}
    </div>
  );
};

export default Inventario;