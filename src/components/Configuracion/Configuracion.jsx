import React, { useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './Configuracion.css';
import iconAgregar from '../../assets/images/svg/agregar.svg';
import { useSnackbar } from 'notistack';
import { customSelectStyles } from '../../styles/estilosGenerales';


const Configuracion = () => {

  const { enqueueSnackbar } = useSnackbar();

  const [usuario, setUsuario] = useState({
    FK_ROL_USUARIO: null,
    NOMBRE_USUARIO: '',
    PATERNO_USUARIO: '',
    MATERNO_USUARIO: '',
    NUMERO_USUARIO: ''
  });

  const rolOptions = [
    { value: 1, label: 'Administrador' },
    { value: 2, label: 'Vendedor' }
  ];

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
      const response = await axios.post('http://localhost:5000/api/usuarios', usuario);
      console.log('Usuario agregado:', response.data);
      enqueueSnackbar('Usuario agregado exitosamente', { variant: 'success' });
      setUsuario({
        FK_ROL_USUARIO: null,
        NOMBRE_USUARIO: '',
        PATERNO_USUARIO: '',
        MATERNO_USUARIO: '',
        NUMERO_USUARIO: ''
      });
    } catch (error) {
      console.error('Error al agregar usuario:', error);
    }
  };

  return (
    <div className="inventario-container">
      <div className="headerTitle">
        <h2>CONFIGURACIÓN</h2>
      </div>
      <form onSubmit={handleSubmit} className="configuracion-nav">
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

        <label htmlFor="NOMBRE_USUARIO">Nombre/s:</label>
        <input
          type="text"
          name="NOMBRE_USUARIO"
          id="NOMBRE_USUARIO"
          value={usuario.NOMBRE_USUARIO}
          onChange={handleChange}
          required
        />

        <label htmlFor="PATERNO_USUARIO">Apellido paterno:</label>
        <input
          type="text"
          name="PATERNO_USUARIO"
          id="PATERNO_USUARIO"
          value={usuario.PATERNO_USUARIO}
          onChange={handleChange}
          required
        />

        <label htmlFor="MATERNO_USUARIO">Apellido materno:</label>
        <input
          type="text"
          name="MATERNO_USUARIO"
          id="MATERNO_USUARIO"
          value={usuario.MATERNO_USUARIO}
          onChange={handleChange}
        />

        <label htmlFor="NUMERO_USUARIO">Número de teléfono:</label>
        <input
          type="text"
          name="NUMERO_USUARIO"
          id="NUMERO_USUARIO"
          value={usuario.NUMERO_USUARIO}
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn-agregar-usuario">Agregar Usuario</button>
      </form>
    </div>
  );
};

export default Configuracion;