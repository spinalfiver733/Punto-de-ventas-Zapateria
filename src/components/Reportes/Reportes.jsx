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
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [metodosPago, setMetodosPago] = useState({});
  // 'excel' | 'pdf' | null — controla qué ícono está generando y bloquea el otro
  const [generando, setGenerando] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const opciones = [
    { value: 'hoy', label: 'Del día' },
    { value: 'semana', label: 'Semanal' },
    { value: 'mensual', label: 'Mensual' }
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

      const { ventas, fechaInicio: inicio, fechaFin: fin } = response.data;

      setVentasData(Array.isArray(ventas) ? ventas : []);
      setFechaInicio(inicio ? new Date(inicio) : null);
      setFechaFin(fin ? new Date(fin) : null);
    } catch (error) {
      console.error('Error fetching ventas data:', error);
      enqueueSnackbar('Error al obtener datos de ventas', { variant: 'error' });
      setVentasData([]);
      setFechaInicio(null);
      setFechaFin(null);
    }
  };

  const handlePeriodoChange = (selectedOption) => {
    setPeriodo(selectedOption);
  };

  // Bandera para saber si hay algo que generar (periodo elegido + datos disponibles)
  const puedeGenerar = Boolean(periodo) && ventasData.length > 0 && !generando;

  const handleGenerarExcel = async () => {
    if (!puedeGenerar) return;
    setGenerando('excel');
    try {
      await generarReporteExcel(ventasData, metodosPago, periodo, fechaInicio, fechaFin, enqueueSnackbar);
    } catch (error) {
      console.error('Error generando reporte Excel:', error);
      enqueueSnackbar('Error al generar el reporte de Excel', { variant: 'error' });
    } finally {
      setGenerando(null);
    }
  };

  const handleGenerarPDF = async () => {
    if (!puedeGenerar) return;
    setGenerando('pdf');
    try {
      await generarReportePDF(ventasData, metodosPago, periodo, fechaInicio, fechaFin, enqueueSnackbar);
    } catch (error) {
      console.error('Error generando reporte PDF:', error);
      enqueueSnackbar('Error al generar el reporte de PDF', { variant: 'error' });
    } finally {
      setGenerando(null);
    }
  };

  return (
    <div className="page-container">
      <div className="headerTitle">
        <h2>REPORTES</h2>
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
          isDisabled={generando !== null}
        />
      </div>

      <div className="reportes-grid">
        <div className={`icon-file-wrap ${generando === 'excel' ? 'generando' : ''}`}>
          <img
            src={iconoExcel}
            className={`icon-file ${!puedeGenerar && generando !== 'excel' ? 'icon-disabled' : ''}`}
            alt="Descargar Excel"
            onClick={handleGenerarExcel}
          />
          {generando === 'excel' && <span className="icon-spinner" aria-label="Generando reporte" />}
        </div>

        <div className={`icon-file-wrap ${generando === 'pdf' ? 'generando' : ''}`}>
          <img
            src={iconoPDF}
            className={`icon-file ${!puedeGenerar && generando !== 'pdf' ? 'icon-disabled' : ''}`}
            alt="Descargar PDF"
            onClick={handleGenerarPDF}
          />
          {generando === 'pdf' && <span className="icon-spinner" aria-label="Generando reporte" />}
        </div>
      </div>

      {!periodo && (
        <p className="reportes-hint">Selecciona un periodo para generar un reporte.</p>
      )}
      {periodo && ventasData.length === 0 && (
        <p className="reportes-hint">No hay ventas registradas en este periodo.</p>
      )}
    </div>
  );
};

export default Reportes;