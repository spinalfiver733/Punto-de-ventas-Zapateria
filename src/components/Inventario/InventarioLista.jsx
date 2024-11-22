import { useState, useMemo } from 'react';
import './InventarioLista.css';

const InventarioLista = ({ inventario }) => {
  const [filters, setFilters] = useState({
    marca: '',
    modelo: '',
    talla: '',
    color: '',
    codigo_barra: '',
    precio: '',
    fecha_ingreso: ''
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
      const fechaFormateada = formatearFecha(item.FECHA_INGRESO);
      return (
        (item.MARCA.toLowerCase().includes(filters.marca.toLowerCase()) || filters.marca === '') &&
        (item.MODELO.toLowerCase().includes(filters.modelo.toLowerCase()) || filters.modelo === '') &&
        (item.TALLA.toString().includes(filters.talla) || filters.talla === '') &&
        (item.COLOR.toLowerCase().includes(filters.color.toLowerCase()) || filters.color === '') &&
        (item.CODIGO_BARRA?.toString().includes(filters.codigo_barra) || filters.codigo_barra === '') &&
        (item.PRECIO.toString().includes(filters.precio) || filters.precio === '') &&
        (fechaFormateada.includes(filters.fecha_ingreso) || filters.fecha_ingreso === '')
      );
    });
  }, [inventario, filters]);

  return (
    <div className="inventario-lista-container">
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
                name="color"
                placeholder="Filtrar color"
                value={filters.color}
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
                name="codigo_barra"
                placeholder="Filtrar código"
                value={filters.codigo_barra}
                onChange={handleFilterChange}
              />
            </th>
            <th>
              <input
                type="text"
                name="precio"
                placeholder="Filtrar precio"
                value={filters.precio}
                onChange={handleFilterChange}
              />
            </th>
            <th>
              <input
                type="text"
                name="fecha_ingreso"
                placeholder="Filtrar fecha"
                value={filters.fecha_ingreso}
                onChange={handleFilterChange}
              />
            </th>
          </tr>
          <tr>
            <th>No.</th>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Color</th>
            <th>Número</th>
            <th>Precio</th>
            <th>Código de Barras</th>
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
              <td>{item.CODIGO_BARRA}</td>
              <td>{formatearFecha(item.FECHA_INGRESO)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventarioLista;