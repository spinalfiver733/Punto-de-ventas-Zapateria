import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import Select from 'react-select';
import '../../styles/estilosGenerales.css';
import { customSelectStyles } from '../../styles/estilosGenerales';

const HistorialVentas = () => {
  const [ventas, setVentas] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const [filtroEstatus, setFiltroEstatus] = useState({ value: 'GLOBAL', label: 'GLOBAL' });

  const opcionesEstatus = [
    { value: 'GLOBAL', label: 'GLOBAL' },
    { value: 'FINALIZADA', label: 'FINALIZADA' },
    { value: 'DEVOLUCIÓN', label: 'DEVOLUCIÓN' }
  ];

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const estado = filtroEstatus.value === 'GLOBAL' ? '' : filtroEstatus.value;
        const response = await axios.get(`/api/ventas/historial${estado ? `?estado=${estado}` : ''}`);
        setVentas(response.data);
      } catch (error) {
        console.error('Error al obtener historial de ventas:', error);
        enqueueSnackbar('Error al cargar el historial de ventas', { variant: 'error' });
      }
    };

    fetchVentas();
  }, [filtroEstatus, enqueueSnackbar]);

  const handleEstatusChange = (selectedOption) => {
    setFiltroEstatus(selectedOption);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'/*,
      hour: '2-digit',
      minute: '2-digit'*/
    }).replace(',', ' - ');
  };

  return (
    <div className="historial-ventas">
      <div className="selector-container">
        <label htmlFor="estatus">Filtrar por estatus:</label>
        <Select
          id="estatus"
          value={filtroEstatus}
          onChange={handleEstatusChange}
          options={opcionesEstatus}
          styles={customSelectStyles}
        />
      </div>

      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Color</th>
            <th>Número</th>
            <th>Precio</th>
            <th>Método de pago</th>
            <th>Vendedor</th>
            <th>Tipo</th>
            <th>Código de Barras</th>
            <th>Fecha de venta</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((venta, index) => (
            <tr key={venta.PK_VENTA}>
              <td>{index + 1}</td>
              <td>{venta.MARCA}</td>
              <td>{venta.MODELO}</td>
              <td>{venta.COLOR}</td>
              <td>{venta.TALLA}</td>
              <td>${parseFloat(venta.PRECIO).toFixed(2)}</td>
              <td>{venta.MetodoPago?.DESCRIPCION_METODO}</td>
              <td>{venta.Vendedor?.NOMBRE_USUARIO}</td>
              <td>{venta.Estatus?.DESCRIPCION}</td>
              <td>{venta.CODIGO_BARRA}</td>
              <td>{formatDate(venta.FECHA_VENTA)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistorialVentas;