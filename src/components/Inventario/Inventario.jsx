import { useState, useEffect } from 'react';
import axios from 'axios';
import './Inventario.css';
import InventarioLista from './InventarioLista';
import AgregarInventario from './AgregarInventario';

const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [vistaActual, setVistaActual] = useState('lista'); // 'lista' o 'agregar'

  const fetchInventario = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/inventario');
      setInventario(response.data);
    } catch (error) {
      console.log('Error fetching inventario:', error);
    }
  };

  useEffect(() => {
    fetchInventario();
  }, []);

  return (
    <div className="inventario-container">
      <div className="headerTitle">
        <h2>INVENTARIO</h2>
      </div>
      <div className="inventario-nav">
        <div 
          onClick={() => setVistaActual('lista')}
          className={`nav-item ${vistaActual === 'lista' ? 'active' : ''}`}
        >
          Ver Inventario
        </div>
        <div 
          onClick={() => setVistaActual('agregar')}
          className={`nav-item ${vistaActual === 'agregar' ? 'active' : ''}`}
        >
          Agregar al Inventario
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