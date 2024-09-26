import React from 'react';

const InventarioLista = ({ inventario }) => {
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no válida';
    const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  };
  return (
    <table>
      <thead>
        <tr>
          <th>No.</th>
          <th>Modelo</th>
          <th>Talla</th>
          <th>Color</th>
          <th>Precio</th>
          <th>Fecha de Venta</th>
        </tr>
      </thead>
      <tbody>
        {inventario.map((item) => (
          
          <tr key={item.PK_PRODUCTO}>
            <td>{item.PK_PRODUCTO}</td>
            <td>{item.MODELO}</td>
            <td>{item.TALLA}</td>
            <td>{item.COLOR}</td>
            <td>{item.PRECIO}</td>
            <td>{formatearFecha(item.FECHA_INGRESO)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventarioLista;