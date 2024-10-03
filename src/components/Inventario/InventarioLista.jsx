import React, { useState, useMemo } from 'react';
import './InventarioLista.css';

const InventarioLista = ({ inventario }) => {
  const [filters, setFilters] = useState({
    busquedaGeneral: '',
    marca: '',
    modelo: '',
    talla: '',
    color: ''
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no válida';
    const opciones = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(fecha).toLocaleDateString('es-ES', opciones);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const filteredInventario = useMemo(() => {
    return inventario.filter(item => {
      return (
        (item.MARCA.toLowerCase().includes(filters.marca.toLowerCase()) || filters.marca === '') &&
        (item.MODELO.toLowerCase().includes(filters.modelo.toLowerCase()) || filters.modelo === '') &&
        (item.TALLA.toString().includes(filters.talla) || filters.talla === '') &&
        (item.COLOR.toLowerCase().includes(filters.color.toLowerCase()) || filters.color === '') &&
        (
          item.MARCA.toLowerCase().includes(filters.busquedaGeneral.toLowerCase()) ||
          item.MODELO.toLowerCase().includes(filters.busquedaGeneral.toLowerCase()) ||
          item.TALLA.toString().includes(filters.busquedaGeneral) ||
          item.COLOR.toLowerCase().includes(filters.busquedaGeneral.toLowerCase()) ||
          item.PRECIO.toString().includes(filters.busquedaGeneral) ||
          formatearFecha(item.FECHA_INGRESO).includes(filters.busquedaGeneral) ||
          filters.busquedaGeneral === ''
        )
      );
    });
  }, [inventario, filters]);

  return (
    <div className="inventario-lista-container">
      <div className="busqueda-general">
        <input
          type="text"
          name="busquedaGeneral"
          placeholder="Búsqueda general"
          value={filters.busquedaGeneral}
          onChange={handleFilterChange}
        />
      </div>
      <table className="inventario-tabla">
        <thead>
          <tr className="filtros-row">
            <th></th>
            <th>
              <input
                type="text"
                name="marca"
                placeholder="Filtrar marca"
                value={filters.marca}
                onChange={handleFilterChange}
              />
            </th>
            <th>
              <input
                type="text"
                name="modelo"
                placeholder="Filtrar modelo"
                value={filters.modelo}
                onChange={handleFilterChange}
              />
            </th>
            <th>
              <input
                type="text"
                name="talla"
                placeholder="Filtrar talla"
                value={filters.talla}
                onChange={handleFilterChange}
              />
            </th>
            <th>
              <input
                type="text"
                name="color"
                placeholder="Filtrar color"
                value={filters.color}
                onChange={handleFilterChange}
              />
            </th>
            <th></th>
            <th></th>
          </tr>
          <tr>
            <th>No.</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Color</th>
            <th>Número</th>
            <th>Precio</th>
            <th>Fecha de Ingreso</th>
          </tr>
        </thead>
        <tbody>
          {filteredInventario.map((item, index) => (
            <tr key={item.PK_PRODUCTO}>
              <td>{index + 1}</td>
              <td>{item.MARCA}</td>
              <td>{item.MODELO}</td>        
              <td>{item.COLOR}</td>
              <td>{item.TALLA}</td>
              <td>{item.PRECIO}</td>
              <td>{formatearFecha(item.FECHA_INGRESO)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventarioLista;