import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, parseISO } from 'date-fns';

export const generarReportePDF = (ventasData, metodosPago, periodo, enqueueSnackbar) => {
  if (!periodo) {
    enqueueSnackbar('Por favor, seleccione un periodo antes de generar el reporte.', { variant: 'warning' });
    return;
  }

  if (ventasData.length === 0) {
    enqueueSnackbar('No hay datos para generar el reporte', { variant: 'warning' });
    return;
  }

  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });
    
    // Encabezado
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('ZAPATERIA JR', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha del reporte: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });
    doc.text(`Reporte ${periodo.label}`, doc.internal.pageSize.getWidth() / 2, 28, { align: 'center' });

    // Preparar datos para la tabla
    const tableData = ventasData.map((venta, index) => [
      index + 1,
      venta.MARCA || '',
      venta.COLOR || '',
      venta.TALLA || '',
      venta.VENDEDOR || '',
      `$${parseFloat(venta.PRECIO).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      metodosPago[venta.METODO_PAGO] || venta.METODO_PAGO || '',
      venta.CODIGO_BARRA || 'No disponible',
      venta.OBSERVACIONES || '',
      venta.FECHA_VENTA ? format(parseISO(venta.FECHA_VENTA), 'dd/MM/yy hh:mm a') : 'Sin fecha'
    ]);

    // Calcular total
    const totalVentas = ventasData.reduce((sum, venta) => sum + parseFloat(venta.PRECIO), 0);

    // Generar tabla usando autoTable importado
    autoTable(doc, {
      startY: 35,
      head: [[
        'No.',
        'MARCA',
        'COLOR',
        'NÚMERO',
        'VENDEDOR',
        'PRECIO',
        'MÉTODO DE PAGO',
        'CÓDIGO DE BARRAS',
        'OBSERVACIONES',
        'FECHA DE VENTA'
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 110, 49],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        fontSize: 9
      },
      bodyStyles: {
        fontSize: 8,
        halign: 'center',
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 25, halign: 'left' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 20, halign: 'right' },
        6: { cellWidth: 30, halign: 'center' },
        7: { cellWidth: 30, halign: 'center' },
        8: { cellWidth: 40, halign: 'left' },
        9: { cellWidth: 30, halign: 'center' }
      },
      margin: { top: 35, right: 10, bottom: 30, left: 10 },
      didDrawPage: function (data) {
        const pageCount = doc.internal.getNumberOfPages();
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        
        doc.setFontSize(8);
        doc.text(
          `Página ${data.pageNumber} de ${pageCount}`,
          data.settings.margin.left,
          pageHeight - 10
        );
      }
    });

    // Agregar total al final
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Total de Ventas: $${totalVentas.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      doc.internal.pageSize.getWidth() - 15,
      finalY,
      { align: 'right' }
    );

    // Guardar el PDF
    doc.save(`Reporte_Ventas_${periodo.value}.pdf`);
    enqueueSnackbar('Reporte PDF generado con éxito', { variant: 'success' });
  } catch (error) {
    console.error('Error generating PDF report:', error);
    enqueueSnackbar('Error al generar el reporte PDF', { variant: 'error' });
  }
};