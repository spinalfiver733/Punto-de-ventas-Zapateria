import { useState, useMemo } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import './Devoluciones.css';

const SaldosDevoluciones = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [codigoConsulta, setCodigoConsulta] = useState('');
  const [consultaRealizada, setConsultaRealizada] = useState(false);
  const [saldoInfo, setSaldoInfo] = useState(null);
  const [historialSaldos, setHistorialSaldos] = useState([]);
  const [filters, setFilters] = useState({
    busquedaGeneral: '',
    codigo: '',
    estado: '',
    fecha: '',
    monto: ''
  });

  // Consulta de saldo específico
  const consultarSaldo = async () => {
    if (!codigoConsulta.trim()) {
      enqueueSnackbar('Por favor ingrese un código de saldo', { variant: 'warning' });
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/saldos/${codigoConsulta}`);
      setSaldoInfo(response.data);
      setConsultaRealizada(true);
      
      if (response.data.estado === 'activo') {
        enqueueSnackbar(`Saldo disponible: $${response.data.monto}`, { variant: 'success' });
      } else {
        enqueueSnackbar('Este saldo ya ha sido utilizado', { variant: 'info' });
      }
    } catch (error) {
      console.error('Error al consultar saldo:', error);
      enqueueSnackbar('Código de saldo no encontrado', { variant: 'error' });
      setSaldoInfo(null);
    }
  };

  // Cargar historial de saldos
  const cargarHistorialSaldos = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/saldos/historial/todos');
      setHistorialSaldos(response.data);
    } catch (error) {
      console.error('Error al cargar historial de saldos:', error);
      enqueueSnackbar('Error al cargar historial de saldos', { variant: 'error' });
    }
  };

  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  // Filtrar saldos
  const saldosFiltrados = useMemo(() => {
    return historialSaldos.filter(saldo => {
      const fechaCreacion = format(new Date(saldo.FECHA_CREACION), 'dd/MM/yyyy');
      
      return (
        saldo.CODIGO_UNICO.toLowerCase().includes(filters.codigo.toLowerCase()) &&
        saldo.ESTADO.toLowerCase().includes(filters.estado.toLowerCase()) &&
        fechaCreacion.includes(filters.fecha) &&
        saldo.MONTO.toString().includes(filters.monto) &&
        (
          saldo.CODIGO_UNICO.toLowerCase().includes(filters.busquedaGeneral.toLowerCase()) ||
          saldo.ESTADO.toLowerCase().includes(filters.busquedaGeneral.toLowerCase()) ||
          saldo.MONTO.toString().includes(filters.busquedaGeneral) ||
          fechaCreacion.includes(filters.busquedaGeneral) ||
          !filters.busquedaGeneral
        )
      );
    });
  }, [historialSaldos, filters]);

  // Componente para mostrar el detalle de un saldo
  const SaldoDetalle = ({ saldo }) => {
    if (!saldo) return null;

    return (
      <div className="saldo-detalle">
        <h3>Información del Saldo</h3>
        <div className="saldo-info-grid">
          <div className="info-item">
            <label>Código:</label>
            <span>{saldo.CODIGO_UNICO}</span>
          </div>
          <div className="info-item">
            <label>Monto:</label>
            <span>${parseFloat(saldo.MONTO).toFixed(2)}</span>
          </div>
          <div className="info-item">
            <label>Estado:</label>
            <span className={`estado-badge ${saldo.ESTADO}`}>
              {saldo.ESTADO.charAt(0).toUpperCase() + saldo.ESTADO.slice(1)}
            </span>
          </div>
          <div className="info-item">
            <label>Fecha de Creación:</label>
            <span>{format(new Date(saldo.FECHA_CREACION), 'PPP', { locale: es })}</span>
          </div>
          {saldo.FK_VENTA_USO && (
            <div className="info-item">
              <label>Usado en Venta:</label>
              <span>#{saldo.FK_VENTA_USO}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="saldos-devoluciones-container">
      {/* Sección de consulta de saldo */}
      <div className="consulta-saldo-section">
        <h3>Consultar Saldo a Favor</h3>
        <div className="consulta-form">
          <input
            type="text"
            value={codigoConsulta}
            onChange={(e) => setCodigoConsulta(e.target.value.toUpperCase())}
            placeholder="Ingrese código de saldo"
            maxLength="8"
            className="codigo-input"
          />
          <button onClick={consultarSaldo} className="btn-primary">
            Consultar
          </button>
        </div>
        
        {consultaRealizada && saldoInfo && <SaldoDetalle saldo={saldoInfo} />}
      </div>

      {/* Historial de Saldos */}
      <div className="historial-saldos-section">
        <div className="historial-header">
          <h3>Historial de Saldos</h3>
          <button onClick={cargarHistorialSaldos} className="btn-secondary">
            Actualizar Historial
          </button>
        </div>

        <div className="saldos-table-container">
          <table className="saldos-table">
            <thead>
              <tr className="filtros-row">
                <th>
                  <input
                    type="text"
                    name="codigo"
                    placeholder="Filtrar código"
                    value={filters.codigo}
                    onChange={handleFilterChange}
                  />
                </th>
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
                    name="monto"
                    placeholder="Filtrar monto"
                    value={filters.monto}
                    onChange={handleFilterChange}
                  />
                </th>
                <th>
                  <input
                    type="text"
                    name="estado"
                    placeholder="Filtrar estado"
                    value={filters.estado}
                    onChange={handleFilterChange}
                  />
                </th>
              </tr>
              <tr>
                <th>Código</th>
                <th>Fecha de Creación</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {saldosFiltrados.map((saldo) => (
                <tr key={saldo.PK_SALDO}>
                  <td>{saldo.CODIGO_UNICO}</td>
                  <td>{format(new Date(saldo.FECHA_CREACION), 'dd/MM/yyyy HH:mm')}</td>
                  <td>${parseFloat(saldo.MONTO).toFixed(2)}</td>
                  <td>
                    <span className={`estado-badge ${saldo.ESTADO}`}>
                      {saldo.ESTADO.charAt(0).toUpperCase() + saldo.ESTADO.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SaldosDevoluciones;
