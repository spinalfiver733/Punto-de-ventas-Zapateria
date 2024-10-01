import { useState } from 'react';
import axios from 'axios';
import iconAgregar from '../../assets/images/svg/agregar.svg';

const AgregarInventario = ({ onProductoAgregado }) => {
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    numero: '',  
    color: '',
    precio: ''
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!formData.marca || !formData.modelo || !formData.numero || !formData.color || !formData.precio) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    try {
      console.log('Enviando datos:', formData);
      const response = await axios.post('http://localhost:5000/api/inventario', formData);
      console.log('Respuesta completa:', response);

      if (response.data) {
        console.log('Datos de respuesta:', response.data);
        setSuccessMessage('Producto agregado con éxito.');
        onProductoAgregado(response.data);
        setFormData({marca: '', modelo: '', numero: '', color: '', precio: '' });
      } else {
        console.log('Respuesta vacía o inesperada');
        setError('La respuesta del servidor no contiene datos. Por favor, verifica el backend.');
      }
    } catch (error) {
      console.error('Error al agregar producto:', error);
      setError(`Error al agregar el producto: ${error.message}`);
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
            <select id="numero" name="numero" value={formData.numero} onChange={handleChange} required>
              <option value="">SELECCIONA UNA OPCIÓN</option>
              <option value="21">21</option>
              <option value="22">22</option>
              <option value="23">23</option>
              <option value="35">35</option>
              <option value="36">36</option>
              <option value="37">37</option>
              {/* Agrega más opciones según sea necesario */}
            </select>
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
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}
        <button type="submit" className="btn-agregar">
          <img src={iconAgregar} alt="Agregar producto" />
          AGREGAR AL INVENTARIO
        </button>
      </form>
    </div>
  );
};

export default AgregarInventario;