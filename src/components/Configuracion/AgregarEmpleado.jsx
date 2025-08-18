
import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useSnackbar } from 'notistack';
import { customSelectStyles } from '../../styles/estilosGenerales';
import iconAgregar from '../../assets/images/svg/agregar.svg';

const AgregarEmpleado = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [usuario, setUsuario] = useState({
    FK_ROL_USUARIO: null,
    NOMBRE_USUARIO: '',
    PATERNO_USUARIO: '',
    MATERNO_USUARIO: '',
    NUMERO_USUARIO: ''
  });

  const [rolOptions, setRolOptions] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('/api/roles');
        const roles = response.data.map(rol => ({
          value: rol.ID_ROL,
          label: rol.DESCRIPCION_ROL
        }));
        setRolOptions(roles);
      } catch (error) {
        enqueueSnackbar('Error al cargar los roles', { variant: 'error' });
      }
    };

    fetchRoles();
  }, [enqueueSnackbar]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prevUsuario => ({
      ...prevUsuario,
      [name]: value
    }));
  };

  const handleRolChange = (selectedOption) => {
    setUsuario(prevUsuario => ({
      ...prevUsuario,
      FK_ROL_USUARIO: selectedOption ? selectedOption.value : null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!usuario.FK_ROL_USUARIO) {
        enqueueSnackbar('Por favor, seleccione un rol para el usuario', {variant: 'warning'});
        return;
      }
      await axios.post('/api/usuarios', usuario);
      enqueueSnackbar('Usuario agregado exitosamente', {variant: 'success'});
      setUsuario({
        FK_ROL_USUARIO: null,
        NOMBRE_USUARIO: '',
        PATERNO_USUARIO: '',
        MATERNO_USUARIO: '',
        NUMERO_USUARIO: ''
      });
    } catch (error) {
      enqueueSnackbar('Error al agregar usuario', {variant: 'error'});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="agregar-empleado-form">
      <div className="form-group">
        <label htmlFor="FK_ROL_USUARIO">Rol:</label>
        <Select
          id="FK_ROL_USUARIO"
          value={rolOptions.find(option => option.value === usuario.FK_ROL_USUARIO)}
          onChange={handleRolChange}
          options={rolOptions}
          isClearable
          isSearchable
          placeholder="Seleccionar rol..."
          styles={customSelectStyles}
        />
      </div>

      <div className="form-group">
        <label htmlFor="NOMBRE_USUARIO">Nombre/s:</label>
        <input
          type="text"
          name="NOMBRE_USUARIO"
          id="NOMBRE_USUARIO"
          value={usuario.NOMBRE_USUARIO}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="PATERNO_USUARIO">Apellido paterno:</label>
        <input
          type="text"
          name="PATERNO_USUARIO"
          id="PATERNO_USUARIO"
          value={usuario.PATERNO_USUARIO}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="MATERNO_USUARIO">Apellido materno:</label>
        <input
          type="text"
          name="MATERNO_USUARIO"
          id="MATERNO_USUARIO"
          value={usuario.MATERNO_USUARIO}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="NUMERO_USUARIO">Número de teléfono:</label>
        <input
          type="text"
          name="NUMERO_USUARIO"
          id="NUMERO_USUARIO"
          value={usuario.NUMERO_USUARIO}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="btn-primary">
        <img src={iconAgregar} alt="Agregar usuario" />
        AGREGAR USUARIO
      </button>
    </form>
  );
};

export default AgregarEmpleado;