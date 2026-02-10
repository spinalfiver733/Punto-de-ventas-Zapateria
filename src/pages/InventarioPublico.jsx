import { useState, useEffect, useMemo } from 'react';
import api from '../config/api.js';
import './InventarioPublico.css';

const InventarioPublico = () => {
  const [inventario, setInventario] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const response = await api.get('/api/inventario');
        setInventario(response.data);
      } catch (error) {
        console.error('Error al cargar inventario:', error);
      } finally {
        setCargando(false);
      }
    };
    fetchInventario();
  }, []);

  const filtrado = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return inventario;
    return inventario.filter(item =>
      item.MARCA?.toLowerCase().includes(q) ||
      item.MODELO?.toLowerCase().includes(q) ||
      item.COLOR?.toLowerCase().includes(q) ||
      item.TALLA?.toString().includes(q)
    );
  }, [inventario, busqueda]);

  return (
    <div className="inv-page">

      <div className="inv-header">
        <h1>INVENTARIO</h1>
        {/*  
        <p className="inv-count">
          {cargando ? '...' : `${filtrado.length} artículo${filtrado.length !== 1 ? 's' : ''}`}
        </p>
        */}
      </div>

      <div className="inv-search-wrap">
        <input
          type="text"
          className="inv-search"
          placeholder="Buscar por marca, modelo, color o talla..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
      </div>

      {cargando ? (
        <p className="inv-mensaje">Cargando...</p>
      ) : filtrado.length === 0 ? (
        <p className="inv-mensaje">Sin resultados para "{busqueda}"</p>
      ) : (
        <div className="inv-table-wrap">
          <table className="inv-table">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th className="col-text">Marca</th>
                <th className="col-text">Modelo</th>
                <th className="col-text">Color</th>
                <th className="col-talla">Talla</th>
              </tr>
            </thead>
            <tbody>
              {filtrado.map((item, index) => (
                <tr key={item.PK_PRODUCTO}>
                  <td className="col-num">{index + 1}</td>
                  <td className="col-text">{item.MARCA}</td>
                  <td className="col-text">{item.MODELO}</td>
                  <td className="col-text">{item.COLOR}</td>
                  <td className="col-talla">{item.TALLA}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

export default InventarioPublico;