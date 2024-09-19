import React, { useState } from 'react';
import axios from 'axios';
import iconAgregar from '../../assets/images/svg/agregar.svg';

const AgregarInventario = ({ onProductoAgregado }) => {
  const [formData, setFormData] = useState({
    producto: '',
    talla: '',
    modelo: '',
    color: '',
    precio: ''
  });
  const [error, setError] = useState('');

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

    // Validación básica
    if (!formData.producto || !formData.talla || !formData.modelo || !formData.color || !formData.precio) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/inventario', formData);
      if (response.data && response.data.id) {
        onProductoAgregado(response.data);
        setFormData({ producto: '', talla: '', modelo: '', color: '', precio: '' });
      } else {
        setError('Error al agregar el producto. Por favor, inténtelo de nuevo.');
      }
    } catch (error) {
      console.error('Error al agregar producto:', error);
      setError('Error al agregar el producto. Por favor, inténtelo de nuevo.');
    }
  };

  return (
    <div className="agregar-inventario-container">
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="producto">Producto:</label>
            <input 
              type="text" 
              id="producto" 
              name="producto" 
              value={formData.producto} 
              onChange={handleChange} 
              placeholder="Nombre del producto"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="talla">Talla:</label>
            <select id="talla" name="talla" value={formData.talla} onChange={handleChange} required>
              <option value="">SELECCIONA UNA OPCIÓN</option>
              <option value="35">35</option>
              <option value="36">36</option>
              <option value="37">37</option>
              {/* Agrega más opciones según sea necesario */}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="modelo">Modelo:</label>
            <input 
              type="text" 
              id="modelo" 
              name="modelo" 
              value={formData.modelo} 
              onChange={handleChange} 
              placeholder="Modelo del producto"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="color">Color:</label>
            <select id="color" name="color" value={formData.color} onChange={handleChange} required>
              <option value="">SELECCIONA UNA OPCIÓN</option>
              <option value="Negro">Negro</option>
              <option value="Blanco">Blanco</option>
              <option value="Rojo">Rojo</option>
              {/* Agrega más opciones según sea necesario */}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="precio">Precio:</label>
            <input 
              type="number" 
              id="precio" 
              name="precio" 
              value={formData.precio} 
              onChange={handleChange} 
              placeholder="Precio del producto"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="btn-agregar">
          <img src={iconAgregar} alt="Agregar producto" />
          AGREGAR AL INVENTARIO
        </button>
      </form>
    </div>
  );
};

export default AgregarInventario;