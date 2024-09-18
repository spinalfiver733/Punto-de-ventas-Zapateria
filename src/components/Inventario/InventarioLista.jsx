import React from 'react';

const InventarioLista = ({ inventario }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Talla</th>
          <th>Modelo</th>
          <th>Vendedor</th>
          <th>Color</th>
          <th>Precio</th>
          <th>Método de Pago</th>
          <th>Fecha de Venta</th>
        </tr>
      </thead>
      <tbody>
        {inventario.map((item) => (
          <tr key={item.PK_PRODUCTO}>
            <td>{item.PK_PRODUCTO}</td>
            <td>{item.TALLA}</td>
            <td>{item.MODELO}</td>
            <td>{item.VENDEDOR}</td>
            <td>{item.COLOR}</td>
            <td>{item.PRECIO}</td>
            <td>{item.METODO_PAGO}</td>
            <td>{new Date(item.FECHA_VENTA).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default InventarioLista;