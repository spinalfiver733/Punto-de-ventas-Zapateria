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
        console.log(response);
        setVentas(response.data);
      } catch (error) {
        console.error('Error al obtener historial de ventas:', error);
        enqueueSnackbar('Error al cargar el historial de ventas', { variant: 'error' });
      }
    };

    fetchVentas();
  }, [enqueueSnackbar]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', ' - '); // Reemplaza la coma con ' - '
  };

  return (
    <div className="historial-ventas">
      <table>
        <thead>
          <tr>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Color</th>
            <th>Número</th>
            <th>Precio</th>
            <th>Método de pago</th>
            <th>Vendedor</th>
            <th>Código de Barras</th>
            <th>Fecha de venta</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta) => (
            <tr key={venta.PK_VENTA}>
              <td>{venta.MARCA}</td>
              <td>{venta.MODELO}</td>
              <td>{venta.COLOR}</td>
              <td>{venta.TALLA}</td>
              <td>${parseFloat(venta.PRECIO).toFixed(2)}</td>
              <td>{venta.MetodoPago?.DESCRIPCION_METODO}</td>
              <td>{venta.Vendedor?.NOMBRE_USUARIO}</td>
              <td>{venta.CODIGO_BARRA}</td>
              <td>{formatDate(venta.FECHA_VENTA)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );};

export default HistorialVentas;