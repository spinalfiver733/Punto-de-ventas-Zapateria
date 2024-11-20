
// EstadoVendedores.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';

const EstadoVendedores = () => {
  const [vendedores, setVendedores] = useState([]);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/usuarios');
        setVendedores(response.data);
      } catch (error) {
        enqueueSnackbar('Error al cargar los vendedores', { variant: 'error' });
      }
    };

    fetchVendedores();
  }, [enqueueSnackbar]);

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
          </tr>
        </thead>
        <tbody>
          {vendedores.map((vendedor) => (
            <tr key={vendedor.ID_USUARIO}>
              <td>{vendedor.NOMBRE_USUARIO}</td>
              <td>{`${vendedor.PATERNO_USUARIO} ${vendedor.MATERNO_USUARIO}`}</td>
              <td>{vendedor.NUMERO_USUARIO}</td>
              <td>{vendedor.FK_ROL_USUARIO}</td>
              <td>{vendedor.ESTATUS_USUARIO ? 'Activo' : 'Inactivo'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EstadoVendedores;