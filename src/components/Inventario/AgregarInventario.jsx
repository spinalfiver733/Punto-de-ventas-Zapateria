import React, { useState } from 'react';
import axios from 'axios';

const AgregarInventario = ({ onProductoAgregado }) => {
  const [nuevoProducto, setNuevoProducto] = useState({
    TALLA: '',
    MODELO: '',
    COLOR: '',
    PRECIO: ''
  });

  const handleChange = (e) => {
    setNuevoProducto({ ...nuevoProducto, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/inventario', nuevoProducto);
      onProductoAgregado();
      setNuevoProducto({ TALLA: '', MODELO: '', COLOR: '', PRECIO: '' });
    } catch (error) {
      console.error('Error al agregar producto:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="TALLA" value={nuevoProducto.TALLA} onChange={handleChange} placeholder="Talla" />
      <input name="MODELO" value={nuevoProducto.MODELO} onChange={handleChange} placeholder="Modelo" />
      <input name="COLOR" value={nuevoProducto.COLOR} onChange={handleChange} placeholder="Color" />
      <input name="PRECIO" value={nuevoProducto.PRECIO} onChange={handleChange} placeholder="Precio" type="number" />
      <button type="submit">Agregar al Inventario</button>
    </form>
  );
};

export default AgregarInventario;
