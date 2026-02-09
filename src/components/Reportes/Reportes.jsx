import { useState, useEffect } from 'react';
import Select from 'react-select';
import './Reportes.css';
import iconoExcel from '../../assets/images/svg/iconoExcel.svg';
import iconoPDF from '../../assets/images/svg/iconoPDF.svg';
import { useSnackbar } from 'notistack';
import { customSelectStyles } from '../../styles/estilosGenerales';
import api from '../../config/api.js';
import { generarReporteExcel } from './generarReporteExcel';
import { generarReportePDF } from './generarReportePDF';

const API_BASE_URL = '/api';

const Reportes = () => {
  const [periodo, setPeriodo] = useState(null);
  const [ventasData, setVentasData] = useState([]);
  const [metodosPago, setMetodosPago] = useState({});
  const { enqueueSnackbar } = useSnackbar();

  const opciones = [
    { value: 'hoy', label: 'Del día' },
    { value: 'semana', label: 'Semanal' },
    { value: 'mensual', label: 'Mensual' },
    { value: 'anual', label: 'Anual' }
  ];

  useEffect(() => {
    fetchMetodosPago();
  }, []);

  useEffect(() => {
    if (periodo) {
      fetchVentasData();
    }
  }, [periodo]);

  const fetchMetodosPago = async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/metodosPago`);
      const metodos = response.data.reduce((acc, metodo) => {
        acc[metodo.PK_METODO] = metodo.DESCRIPCION_METODO;
        return acc;
      }, {});
      setMetodosPago(metodos);
    } catch (error) {
      console.error('Error fetching metodos de pago:', error);
      enqueueSnackbar('Error al obtener métodos de pago', { variant: 'error' });
    }
  };

  const fetchVentasData = async () => {
    try {
      const response = await api.get(`${API_BASE_URL}/ventas`, {
        params: { periodo: periodo.value, soloFinalizadas: true }
      });
      setVentasData(Array.isArray(response.data) ? response.data : []);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching ventas data:', error);
      enqueueSnackbar('Error al obtener datos de ventas', { variant: 'error' });
      setVentasData([]);
    }
  };

  const handlePeriodoChange = (selectedOption) => {
    setPeriodo(selectedOption);
  };

  const handleGenerarExcel = () => {
    generarReporteExcel(ventasData, metodosPago, periodo, enqueueSnackbar);
  };

  const handleGenerarPDF = () => {
    generarReportePDF(ventasData, metodosPago, periodo, enqueueSnackbar);
  };

  return (
    <div className="page-container">
      <div className="headerTitle">
        <h2>REPORTES</h2>
      </div>

      <div className="reportes-grid">
        <img
          src={iconoExcel}
          className="icon-file"
          alt="Descargar Excel"
          onClick={handleGenerarExcel}
        />
        <img
          src={iconoPDF}
          className="icon-file"
          alt="Descargar PDF"
          onClick={handleGenerarPDF}
        />
      </div>

      <div className="reportes-select-container">
        <label htmlFor="periodo-selector">Periodo:</label>
        <Select
          id="periodo-selector"
          value={periodo}
          onChange={handlePeriodoChange}
          options={opciones}
          styles={customSelectStyles}
          placeholder="Seleccionar periodo..."
          className="select-period"
        />
      </div>
    </div>
  );
};

export default Reportes;