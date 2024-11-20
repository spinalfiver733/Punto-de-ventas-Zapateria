
// HistorialVentas.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const HistorialVentas = () => {
  const [ventas, setVentas] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ventas/historial');
        console.log('Datos de ventas:', response.data);
        setVentas(response.data);
      } catch (error) {
        console.error('Error al obtener historial de ventas:', error);
        enqueueSnackbar('Error al cargar el historial de ventas', { variant: 'error' });
      }
    };

    fetchVentas();
  }, [enqueueSnackbar]);

  return (
    <div className="historial-ventas">
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Vendedor</th>
            <th>Productos</th>
            <th>Método de Pago</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.PK_VENTA}>
              <td>{new Date(venta.FECHA_VENTA).toLocaleDateString()}</td>
              <td>{venta.VENDEDOR}</td>
              <td>{venta.productos?.length || 0}</td>
              <td>{venta.METODO_PAGO}</td>
              <td>${venta.TOTAL?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistorialVentas;