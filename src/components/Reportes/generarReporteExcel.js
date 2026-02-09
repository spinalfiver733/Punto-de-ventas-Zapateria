import ExcelJS from 'exceljs';
import { format, parseISO } from 'date-fns';

export const generarReporteExcel = async (ventasData, metodosPago, periodo, enqueueSnackbar) => {
  if (!periodo) {
    enqueueSnackbar('Por favor, seleccione un periodo antes de generar el reporte.', { variant: 'warning' });
    return;
  }

  if (ventasData.length === 0) {
    enqueueSnackbar('No hay datos para generar el reporte', { variant: 'warning' });
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reporte de Ventas');

    const columns = [
      { header: 'No.', key: 'no', width: 5 },
      { header: 'MARCA', key: 'marca', width: 15 },
      { header: 'COLOR', key: 'color', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'NÚMERO', key: 'talla', width: 10, style: { alignment: { horizontal: 'center' } } },
      { header: 'VENDEDOR', key: 'vendedor', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'PRECIO', key: 'precio', width: 15, style: { alignment: { horizontal: 'center' } } },
      { header: 'METODO DE PAGO', key: 'metodoPago', width: 20, style: { alignment: { horizontal: 'center' } } },
      { header: 'CÓDIGO DE BARRAS', key: 'codigo_barra', width: 20, style: { alignment: { horizontal: 'center' } } },
      { header: 'OBSERVACIONES', key: 'observaciones', width: 35 },
      { header: 'FECHA DE VENTA', key: 'fecha_venta', width: 18, style: { alignment: { horizontal: 'center' } } }
    ];

    worksheet.columns = columns;

    // Agregar encabezados
    worksheet.spliceRows(1, 0, [], [], []);
    worksheet.mergeCells('A1:J1');
    worksheet.getCell('A1').value = 'ZAPATERIA JR';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:J2');
    worksheet.getCell('A2').value = `Fecha del reporte: ${new Date().toLocaleDateString()}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A3:J3');
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
    ventasData.forEach((venta, index) => {
      const row = worksheet.addRow({
        no: index + 1,
        marca: venta.MARCA,
        talla: venta.TALLA,
        vendedor: venta.VENDEDOR,
        color: venta.COLOR,
        precio: parseFloat(venta.PRECIO),
        metodoPago: metodosPago[venta.METODO_PAGO] || venta.METODO_PAGO,
        codigo_barra: venta.CODIGO_BARRA || 'No disponible',
        fecha_venta: format(parseISO(venta.FECHA_VENTA), 'dd/MM/yy hh:mm a'),
        observaciones: venta.OBSERVACIONES
      });
      row.getCell('precio').numFmt = '$#,##0.00';
      totalVentas += parseFloat(venta.PRECIO);

      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

    // Agregar total de ventas
    const lastRow = worksheet.lastRow.number + 2;
    worksheet.mergeCells(`A${lastRow}:I${lastRow}`);
    worksheet.getCell(`A${lastRow}`).value = 'Total de Ventas:';
    worksheet.getCell(`A${lastRow}`).font = { bold: true };
    worksheet.getCell(`A${lastRow}`).alignment = { horizontal: 'right' };
    worksheet.getCell(`J${lastRow}`).value = totalVentas;
    worksheet.getCell(`J${lastRow}`).numFmt = '$#,##0.00';

    worksheet.getRow(lastRow).eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F0' }
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Generar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Ventas_${periodo.value}.xlsx`;
    link.click();
    URL.revokeObjectURL(link.href);

    enqueueSnackbar('Reporte generado con éxito', { variant: 'success' });
  } catch (error) {
    console.error('Error generating Excel report:', error);
    enqueueSnackbar('Error al generar el reporte de Excel', { variant: 'error' });
  }
};