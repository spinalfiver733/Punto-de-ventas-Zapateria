import { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import api from '../../config/api.js';

const EstadoVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchVendedores = async () => {
    try {
      const response = await api.get('/api/usuarios');
      console.log(response);
      setVendedores(response.data);
    } catch (error) {
      enqueueSnackbar('Error al cargar los vendedores', { variant: 'error' });
    }
  };

  useEffect(() => {
    fetchVendedores();
  }, [enqueueSnackbar]);

  const handleToggleStatus = async (idUsuario, estadoActual) => {
    try {
      await api.patch(`/api/usuarios/${idUsuario}/toggle-status`);
      enqueueSnackbar(
        `Usuario ${estadoActual ? 'desactivado' : 'activado'} exitosamente`, 
        { variant: 'success' }
      );
      // Recargar la lista de vendedores
      fetchVendedores();
    } catch (error) {
      enqueueSnackbar('Error al cambiar el estado del usuario', { variant: 'error' });
    }
  };

  return (
    <div className="estado-vendedores">
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellidos</th>
            <th>Teléfono</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {vendedores.map((vendedor) => (
            <tr key={vendedor.ID_USUARIO}>
              <td>{vendedor.NOMBRE_USUARIO}</td>
              <td>{`${vendedor.PATERNO_USUARIO} ${vendedor.MATERNO_USUARIO}`}</td>
              <td>{vendedor.NUMERO_USUARIO}</td>
              <td>{vendedor.Rol.DESCRIPCION_ROL}</td>
              <td>{Boolean(vendedor.ESTATUS_USUARIO) ? 'Activo' : 'Inactivo'}</td>
              <td>
                <button 
                  className={`btn ${vendedor.ESTATUS_USUARIO ? 'btn-danger' : 'btn-success'}`}
                  onClick={() => handleToggleStatus(vendedor.ID_USUARIO, vendedor.ESTATUS_USUARIO)}
                >
                  {vendedor.ESTATUS_USUARIO ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EstadoVendedores;