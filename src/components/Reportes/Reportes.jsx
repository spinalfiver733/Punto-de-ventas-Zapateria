import { useState, useEffect } from 'react';
import Select from 'react-select';
import ExcelJS from 'exceljs';
import './Reportes.css';
import iconoExcel from '../../assets/images/svg/iconoExcel.svg';
import iconoPDF from '../../assets/images/svg/iconoPDF.svg';
import { useSnackbar } from 'notistack';
import { customSelectStyles } from '../../styles/estilosGenerales';
import axios from 'axios';
import { format, parseISO } from 'date-fns';

const API_BASE_URL = 'http://localhost:5000/api';

const Reportes = () => {
  const [periodo, setPeriodo] = useState(null);
  const [ventasData, setVentasData] = useState([]);
  const [metodosPago, setMetodosPago] = useState({});
  const { enqueueSnackbar } = useSnackbar();


  const opciones = [
    { value: 'hoy'    , label: 'Del día' },
    { value: 'semana' , label: 'Semanal' },
    { value: 'mensual', label: 'Mensual' },
    { value: 'anual'  , label: 'Anual'   }
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
      const response = await axios.get(`${API_BASE_URL}/metodosPago`);
      const metodos = response.data.reduce((acc, metodo) => {
        acc[metodo.PK_METODO] = metodo.DESCRIPCION_METODO;
        return acc;
      }, {});
      setMetodosPago(metodos);
    } catch (error) {
      //console.error('Error fetching metodos de pago:', error);
      enqueueSnackbar('Error al obtener métodos de pago', { variant: 'error' });
    }
  };

  const fetchVentasData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ventas`, {
        params: { periodo: periodo.value }
      });
      setVentasData(Array.isArray(response.data) ? response.data : []);
      console.log(response.data);
    } catch (error) {
      //console.error('Error fetching ventas data:', error);
      enqueueSnackbar('Error al obtener datos de ventas', { variant: 'error' });
      setVentasData([]);
    }
  };

  const handlePeriodoChange = (selectedOption) => {
    setPeriodo(selectedOption);
  };

  const generarReporteExcel = async () => {
    if (!periodo) {
      enqueueSnackbar('Por favor, seleccione un periodo antes de generar el reporte.', { variant: 'warning' });
      return;
    }
  
    // console.log('Periodo seleccionado:', periodo);
    // console.log('Datos de ventas:', ventasData);
  
    if (ventasData.length === 0) {
      //console.log('No hay datos de ventas para generar el reporte');
      enqueueSnackbar('No hay datos para generar el reporte', { variant: 'warning' });
      return;
    }
  
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte de Ventas');
  
      // Definir columnas primero
      const columns = [
        { header: 'No.', key: 'no', width: 5 },
        { header: 'MARCA', key: 'marca', width: 15 },
        { header: 'NÚMERO', key: 'talla', width: 10 , style: { alignment: { horizontal: 'center' } }},
        { header: 'VENDEDOR', key: 'vendedor', width: 15 , style: { alignment: { horizontal: 'center' } }},
        { header: 'COLOR', key: 'color', width: 15 , style: { alignment: { horizontal: 'center' } }},
        { header: 'PRECIO', key: 'precio', width: 15 },
        { header: 'METODO DE PAGO', key: 'metodoPago', width: 20 , style: { alignment: { horizontal: 'center' } }},
        { header: 'OBSERVACIONES', key: 'observaciones', width: 35 },
        { header: 'FECHA DE VENTA', key: 'fecha_venta', width: 18, style: { alignment: { horizontal: 'center' } } }
      ];
  
      worksheet.columns = columns;
  
      // Agregar encabezados después de definir las columnas
      worksheet.spliceRows(1, 0, [], [], []); // Agregar 3 filas vacías al principio
      worksheet.mergeCells('A1:I1');
      worksheet.getCell('A1').value = 'ZAPATERIA JR';
      worksheet.getCell('A1').font = { size: 16, bold: true };
      worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
      worksheet.mergeCells('A2:I2');
      worksheet.getCell('A2').value = `Fecha del reporte: ${new Date().toLocaleDateString()}`;
      worksheet.getCell('A2').alignment = { horizontal: 'center' };
  
      worksheet.mergeCells('A3:I3');
      worksheet.getCell('A3').value = `Reporte ${periodo.label}`;
      worksheet.getCell('A3').alignment = { horizontal: 'center' };
  
      // Estilo para los encabezados de columnas
      const headerRow = worksheet.getRow(4);
      headerRow.values = columns.map(col => col.header);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFF6E31' }
        };
        cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
  
      // Agregar datos
      let totalVentas = 0;
      //console.log('Iniciando agregado de datos al worksheet');
      ventasData.forEach((venta, index) => {
       // console.log(`Procesando venta ${index + 1}:`, venta);
       const row = worksheet.addRow({
          no: index + 1,
          marca: venta.MARCA,
          talla: venta.TALLA,
          vendedor: venta.VENDEDOR,
          color: venta.COLOR,
          precio: parseFloat(venta.PRECIO),
          metodoPago: metodosPago[venta.METODO_PAGO] || venta.METODO_PAGO,
          fecha_venta: format(parseISO(venta.FECHA_VENTA), 'dd/MM/yy hh:mm a'),
          observaciones: venta.OBSERVACIONES
        });
        row.getCell('precio').numFmt = '$#,##0.00';
        //console.log('Fila agregada:', row.values);
        totalVentas += parseFloat(venta.PRECIO);
  
        // Aplicar bordes a las celdas
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          };
        });
      });
      //console.log('Total de ventas calculado:', totalVentas);
  
      // Agregar total de ventas
      const lastRow = worksheet.lastRow.number + 2;

      worksheet.mergeCells(`A${lastRow}:H${lastRow}`);
      worksheet.getCell(`A${lastRow}`).value = 'Total de Ventas:';
      worksheet.getCell(`A${lastRow}`).font = { bold: true };
      worksheet.getCell(`A${lastRow}`).alignment = { horizontal: 'right' };
      worksheet.getCell(`I${lastRow}`).value = totalVentas;
      worksheet.getCell(`I${lastRow}`).numFmt = '$#,##0.00';
  
      // Aplicar estilo a la fila de total
      worksheet.getRow(lastRow).eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F0F0' }
        };
        cell.border = {
          top: {style:'thin'},
          left: {style:'thin'},
          bottom: {style:'thin'},
          right: {style:'thin'}
        };
      });
  
      //console.log('Generación del worksheet completada');
  
      // Generar el archivo
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Reporte_Ventas_${periodo.value}.xlsx`;
      link.click();
      URL.revokeObjectURL(link.href);
  
      //console.log('Archivo Excel generado y descarga iniciada');
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