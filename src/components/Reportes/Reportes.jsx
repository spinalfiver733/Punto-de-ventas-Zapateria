import  { useState, useEffect } from 'react';
import Select from 'react-select';
import * as XLSX from 'xlsx';
import './Reportes.css';
import iconoExcel from '../../assets/images/svg/iconoExcel.svg';
import iconoPDF from '../../assets/images/svg/iconoPDF.svg';
import { useSnackbar } from 'notistack';
import { customSelectStyles } from '../../styles/estilosGenerales';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const Reportes = () => {
  const [periodo, setPeriodo] = useState(null);
  const [ventasData, setVentasData] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const opciones = [
    { value: 'hoy', label: 'Hoy' },
    { value: 'semana', label: 'Semana' },
    { value: 'mensual', label: 'Mensual' },
    { value: 'anual', label: 'Anual' }
  ];

  useEffect(() => {
    if (periodo) {
      fetchVentasData();
    }
  }, [periodo]);

  const fetchVentasData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ventas`, {
        params: { periodo: periodo.value }
      });
      setVentasData(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching ventas data:', error);
      enqueueSnackbar('Error al obtener datos de ventas', { variant: 'error' });
      setVentasData([]);
    }
  };

  const handlePeriodoChange = (selectedOption) => {
    setPeriodo(selectedOption);
  };

  const generarReporteExcel = () => {
    if (!periodo) {
      enqueueSnackbar('Por favor, seleccione un periodo antes de generar el reporte.', { variant: 'warning' });
      return;
    }

    if (ventasData.length === 0) {
      enqueueSnackbar('No hay datos para generar el reporte', { variant: 'warning' });
      return;
    }

    try {
      // Crear un nuevo libro de trabajo
      const wb = XLSX.utils.book_new();
      
      // Preparar los datos con los headers en mayúsculas (excepto 'No.')
      const data = ventasData.map((venta, index) => ({
        'No.': index + 1,
        'MARCA': venta.MARCA || '',
        'TALLA': venta.TALLA || '',
        'VENDEDOR': venta.VENDEDOR || '',
        'COLOR': venta.COLOR || '',
        'PRECIO': venta.PRECIO || '',
        'METODO DE PAGO': venta.METODO_PAGO || '',
        'OBSERVACIONES': venta.OBSERVACIONES || ''
      }));

      // Crear la hoja de cálculo
      const ws = XLSX.utils.json_to_sheet(data, { header: ['No.', 'MARCA', 'TALLA', 'VENDEDOR', 'COLOR', 'PRECIO', 'METODO DE PAGO', 'OBSERVACIONES'] });

      // Establecer el ancho de las columnas
      const wscols = [
        {wch: 5},  // No.
        {wch: 15}, // MARCA
        {wch: 10}, // TALLA
        {wch: 20}, // VENDEDOR
        {wch: 15}, // COLOR
        {wch: 10}, // PRECIO
        {wch: 15}, // METODO DE PAGO
        {wch: 30}  // OBSERVACIONES
      ];
      ws['!cols'] = wscols;

      // Aplicar estilo a los encabezados
      const headerRange = XLSX.utils.decode_range(ws['!ref']);
      for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + "1";
        if (!ws[address]) continue;
        ws[address].s = {
          fill: { fgColor: { rgb: "FF6E31" } },
          font: { color: { rgb: "FFFFFF" }, bold: true },
          alignment: { horizontal: "center", vertical: "center" }
        };
      }

      // Agregar la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, "Reporte de Ventas");

      // Generar el archivo Excel
      XLSX.writeFile(wb, `Reporte_Ventas_${periodo.value}.xlsx`);
      enqueueSnackbar('Reporte generado con éxito', { variant: 'success' });
    } catch (error) {
      console.error('Error generating Excel report:', error);
      enqueueSnackbar('Error al generar el reporte de Excel', { variant: 'error' });
    }
  };

  return (
    <div className="reportes-container">
      <div className="headerTitle">
        <h2>REPORTES</h2>
      </div>
      <div className="content-container">
        <div className="icon-container">
          <img 
            src={iconoExcel} 
            className="icon-file" 
            alt="Descargar Excel" 
            onClick={generarReporteExcel}
            style={{cursor: 'pointer'}}
          />
          <img src={iconoPDF} className="icon-file" alt="Descargar PDF" />
        </div>
        <div className="selector-container">
          <label htmlFor="periodo-selector">Periodo:</label>
          <Select
            id="periodo-selector"
            value={periodo}
            onChange={handlePeriodoChange}
            options={opciones}
            styles={customSelectStyles}
            placeholder="Seleccionar periodo..."
          />
        </div>
      </div>
    </div>
  );
};

export default Reportes;