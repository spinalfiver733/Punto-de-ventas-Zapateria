import { useState, useEffect } from 'react';
import axios from 'axios';
import './Inventario.css';

const Inventario = () => {
  const [inventario, setInventario] = useState([]);

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventario');
        setInventario(response.data);
        console.log(response);
      } catch (error) {
        console.log('Error fetching inventario.');
      }
    };

    fetchVentas();
  }, []);

  return (
    <div className="inventario-container">
      <div className="headerTitle">
        <h2>INVENTARIO</h2>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Talla</th>
            <th>Modelo</th>
            <th>Vendedor</th>
            <th>Color</th>
            <th>Precio</th>
            <th>Método de Pago</th>
            <th>Fecha de Venta</th>
          </tr>
        </thead>
        <tbody>
          {inventario.map((venta) => (
            <tr key={venta.PK_PRODUCTO}>
              <td>{venta.PK_PRODUCTO}</td>
              <td>{venta.TALLA}</td>
              <td>{venta.MODELO}</td>
              <td>{venta.VENDEDOR}</td>
              <td>{venta.COLOR}</td>
              <td>{venta.PRECIO}</td>
              <td>{venta.METODO_PAGO}</td>
              <td>{new Date(venta.FECHA_VENTA).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Inventario;