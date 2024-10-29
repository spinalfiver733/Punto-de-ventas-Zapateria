import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './Devoluciones.css';

const HistorialDevolucion = ({ devoluciones }) => {
  const [filters, setFilters] = useState({
    busquedaGeneral: '',
    marca: '',
    modelo: '',
    motivo: '',
    vendedor: '',
    fecha: '',
    tipo: ''
  });

  const opcionesMotivo = {
    'no_talla': 'No es la talla correcta',
    'no_gusto': 'No le gustó al cliente',
    'defecto_fabrica': 'Defecto de fábrica',
    'otro': 'Otro motivo'
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  const filteredDevoluciones = useMemo(() => {
    return devoluciones.filter(devolucion => {
      const fechaDevolucion = format(new Date(devolucion.FECHA_DEVOLUCION), 'dd/MM/yyyy');
      const producto = devolucion.Producto || {};
      const vendedor = devolucion.Vendedor || {};
      
      return (
        (producto.MARCA?.toLowerCase().includes(filters.marca.toLowerCase()) || !filters.marca) &&
        (producto.MODELO?.toLowerCase().includes(filters.modelo.toLowerCase()) || !filters.modelo) &&
        (devolucion.MOTIVO?.toLowerCase().includes(filters.motivo.toLowerCase()) || !filters.motivo) &&
        (vendedor.NOMBRE_USUARIO?.toLowerCase().includes(filters.vendedor.toLowerCase()) || !filters.vendedor) &&
        (fechaDevolucion.includes(filters.fecha) || !filters.fecha) &&
        (devolucion.TIPO_DEVOLUCION?.toLowerCase().includes(filters.tipo.toLowerCase()) || !filters.tipo) &&
        (
          producto.MARCA?.toLowerCase().includes(filters.busquedaGeneral.toLowerCase()) ||
          producto.MODELO?.toLowerCase().includes(filters.busquedaGeneral.toLowerCase()) ||
          vendedor.NOMBRE_USUARIO?.toLowerCase().includes(filters.busquedaGeneral.toLowerCase()) ||
          fechaDevolucion.includes(filters.busquedaGeneral) ||
          opcionesMotivo[devolucion.MOTIVO]?.toLowerCase().includes(filters.busquedaGeneral.toLowerCase()) ||
          !filters.busquedaGeneral
        )
      );
    });
  }, [devoluciones, filters]);

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Fecha no disponible';
    return format(new Date(fecha), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  return (
    <div className="historial-devolucion-container">
      <div className="busqueda-general">
        <input
          type="text"
          name="busquedaGeneral"
          placeholder="Búsqueda general"
          value={filters.busquedaGeneral}
          onChange={handleFilterChange}
        />
      </div>

      <div className="devolucion-table-container">
        <table className="devolucion-table">
          <thead>
            <tr className="filtros-row">
              <th>
                <input
                  type="text"
                  name="fecha"
                  placeholder="Filtrar fecha"
                  value={filters.fecha}
                  onChange={handleFilterChange}
                />
              </th>
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
                  name="motivo"
                  placeholder="Filtrar motivo"
                  value={filters.motivo}
                  onChange={handleFilterChange}
                />
              </th>
              <th>
                <input
                  type="text"
                  name="vendedor"
                  placeholder="Filtrar vendedor"
                  value={filters.vendedor}
                  onChange={handleFilterChange}
                />
              </th>
              <th>
                <input
                  type="text"
                  name="tipo"
                  placeholder="Filtrar tipo"
                  value={filters.tipo}
                  onChange={handleFilterChange}
                />
              </th>
              <th></th>
            </tr>
            <tr>
              <th>Fecha</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Motivo</th>
              <th>Vendedor</th>
              <th>Tipo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevoluciones.map((devolucion, index) => (
              <tr key={devolucion.PK_DEVOLUCION || index}>
                <td>{formatearFecha(devolucion.FECHA_DEVOLUCION)}</td>
                <td>{devolucion.Producto?.MARCA || 'N/A'}</td>
                <td>{devolucion.Producto?.MODELO || 'N/A'}</td>
                <td>{opcionesMotivo[devolucion.MOTIVO] || devolucion.MOTIVO}</td>
                <td>{devolucion.Vendedor?.NOMBRE_USUARIO || 'N/A'}</td>
                <td>
                  {devolucion.TIPO_DEVOLUCION === 'cambio' ? 'Cambio' : 'Saldo a Favor'}
                  {devolucion.DIFERENCIA_PRECIO && devolucion.DIFERENCIA_PRECIO !== 0 && (
                    <span className="diferencia-precio">
                      {` (${devolucion.DIFERENCIA_PRECIO > 0 ? '+' : ''}${devolucion.DIFERENCIA_PRECIO})`}
                    </span>
                  )}
                </td>
                <td>
                  {devolucion.ESTADO_FINAL === 1 ? (
                    <span className="estado-inventario">Retornado a Inventario</span>
                  ) : (
                    <span className="estado-baja">Dado de Baja</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorialDevolucion;