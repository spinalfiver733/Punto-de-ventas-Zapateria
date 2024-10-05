import { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import Select from 'react-select';
import iconAgregar from '../../assets/images/svg/agregar.svg';
import { customSelectStyles } from '../../styles/estilosGenerales';

// eslint-disable-next-line react/prop-types
const AgregarInventario = ({ onProductoAgregado }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    numero: null,  // Cambiado a null para react-select
    color: '',
    precio: ''
  });

  const numeroOptions = [
    { value: '21', label: '21' },
    { value: '22', label: '22' },
    { value: '23', label: '23' },
    { value: '35', label: '35' },
    { value: '36', label: '36' },
    { value: '37', label: '37' },
    // Agrega más opciones según sea necesario
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSelectChange = (selectedOption) => {
    setFormData(prevState => ({
      ...prevState,
      numero: selectedOption
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.marca || !formData.modelo || !formData.numero || !formData.color || !formData.precio) {
      enqueueSnackbar('Por favor, complete todos los campos.', { variant: 'warning' });
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        numero: formData.numero.value // Extraer el valor del objeto de react-select
      };
      console.log('Enviando datos:', dataToSend);
      const response = await axios.post('http://localhost:5000/api/inventario', dataToSend);
      console.log('Respuesta completa:', response);

      if (response.data) {
        console.log('Datos de respuesta:', response.data);
        enqueueSnackbar('Producto agregado con éxito.', { variant: 'success' });
        onProductoAgregado(response.data);
        setFormData({marca: '', modelo: '', numero: null, color: '', precio: '' });
      } else {
        console.log('Respuesta vacía o inesperada');
        enqueueSnackbar('La respuesta del servidor no contiene datos. Por favor, verifica el backend.', { variant: 'error' });
      }
    } catch (error) {
      console.error('Error al agregar producto:', error);
      enqueueSnackbar(`Error al agregar el producto: ${error.message}`, { variant: 'error' });
    }
  };

  return (
    <div className="agregar-inventario-container">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="marca">Marca:</label>
            <input 
              type="text" 
              id="marca" 
              name="marca" 
              value={formData.marca} 
              onChange={handleChange} 
              placeholder="Ingrese la marca"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="modelo">Modelo:</label>
            <input 
              type="text" 
              id="modelo" 
              name="modelo" 
              value={formData.modelo} 
              onChange={handleChange} 
              placeholder="Ingrese el modelo"
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="color">Color:</label>
            <input 
              type="text" 
              id="color" 
              name="color" 
              value={formData.color} 
              onChange={handleChange} 
              placeholder="Ingrese el color"
              required
            />
          </div>         
          <div className="form-group">
            <label htmlFor="numero">Número:</label>
            <Select
              id="numero"
              name="numero"
              value={formData.numero}
              onChange={handleSelectChange}
              options={numeroOptions}
              styles={customSelectStyles}
              placeholder="Selecciona una opción"
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="precio">Precio:</label>
            <input 
              type="text" 
              id="precio" 
              name="precio" 
              value={formData.precio} 
              onChange={handleChange} 
              placeholder="Precio del producto"
              required
            />
          </div>          
        </div>
        <button type="submit" className="btn-agregar">
          <img src={iconAgregar} alt="Agregar producto" />
          AGREGAR AL INVENTARIO
        </button>
      </form>
    </div>
  );
};

export default AgregarInventario;