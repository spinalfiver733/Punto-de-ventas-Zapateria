import React, { useState } from 'react';
import './Ventas.css';
import iconAgregar from '../../assets/images/svg/agregar.svg';
import iconCodigoBarras from '../../assets/images/svg/escaneoBarras.svg';
// import iconCodigoBarras from '';
// import iconCodigoBarras from '';
const Ventas = () => {
  const [formData, setFormData] = useState({
    producto: '',
    talla: '',
    modelo: '',
    vendedor: '',
    color: '',
    precio: '',
    metodoPago: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí irá la lógica para procesar la venta
    console.log('Datos de la venta:', formData);
  };

  return (
    <div className="ventas-container">
      <h2>VENTAS</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="producto">Producto:</label>
            <select name="producto" value={formData.producto} onChange={handleChange}>
              <option value="">SELECCIONA UNA OPCIÓN</option>
              {/* Opciones de productos */}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="talla">Talla:</label>
            <select name="talla" value={formData.talla} onChange={handleChange}>
              <option value="">SELECCIONA UNA OPCIÓN</option>
              {/* Opciones de tallas */}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="modelo">Modelo:</label>
            <select name="modelo" value={formData.modelo} onChange={handleChange}>
              <option value="">SELECCIONA UNA OPCIÓN</option>
              {/* Opciones de modelos */}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="vendedor">Vendedor:</label>
            <select name="vendedor" value={formData.vendedor} onChange={handleChange}>
              <option value="">SELECCIONA UNA OPCIÓN</option>
              {/* Opciones de vendedores */}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="color">Color:</label>
            <select name="color" value={formData.color} onChange={handleChange}>
              <option value="">SELECCIONA UNA OPCIÓN</option>
              {/* Opciones de colores */}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="precio">Precio:</label>
            <input type="number" name="precio" value={formData.precio} onChange={handleChange} />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="metodoPago">Método de pago:</label>
            <select name="metodoPago" value={formData.metodoPago} onChange={handleChange}>
              <option value="">SELECCIONA UNA OPCIÓN</option>
              {/* Opciones de métodos de pago */}
            </select>
          </div>
        </div>
        <button type="submit" className="btn-agregar">
        <img src={iconAgregar} alt="Icono agregar" className="icono-agregar"/>
        AGREGAR
        </button>

      </form>
      <div className="iconos-accion">
        <img src={iconCodigoBarras} alt="Escanear Codigo de Barras" className="codigoBarras"/>
      </div>
    </div>
  );
};

export default Ventas;