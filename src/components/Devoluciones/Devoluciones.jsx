import React, { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
//import Select from 'react-select';
//import { customSelectStyles } from '../../styles/estilosGenerales';
import './Devoluciones.css';

const Devoluciones = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    codigoBarras: '',
    productoVendido: null
  });

  const handleCodigoBarrasChange = async (e) => {
    const codigoBarras = e.target.value;
    setFormData(prev => ({ ...prev, codigoBarras }));

    if (codigoBarras.length >= 6) {
      try {
        const response = await axios.get(`http://localhost:5000/api/inventario/vendido/${codigoBarras}`);
        
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            productoVendido: response.data
          }));
          enqueueSnackbar('Producto vendido encontrado', { variant: 'success' });
        }
      } catch (error) {
        console.error('Error al buscar el producto vendido:', error);
        setFormData(prev => ({ 
          ...prev, 
          productoVendido: null 
        }));
        enqueueSnackbar('No se encontró el producto vendido', { variant: 'warning' });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevenir cualquier comportamiento por defecto
      if (formData.codigoBarras.length >= 6) {
        buscarProductoVendido();
      }
    }
  };

  const buscarProductoVendido = async () => {
    if (formData.codigoBarras.length < 6) {
      enqueueSnackbar('El código de barras debe tener al menos 6 caracteres', { variant: 'warning' });
      return;
    }

    try {
      const response = await axios.get(`http://localhost:5000/api/inventario/vendido/${formData.codigoBarras}`);
      
      if (response.data) {
        setFormData(prev => ({
          ...prev,
          productoVendido: response.data
        }));
        enqueueSnackbar('Producto vendido encontrado', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error al buscar el producto vendido:', error);
      setFormData(prev => ({ ...prev, productoVendido: null }));
      enqueueSnackbar('No se encontró el producto o ocurrió un error', { variant: 'error' });
    }
  };

  const formatearPrecio = (precioStr) => {
    if (!precioStr) return '0.00';
    const precio = parseFloat(precioStr);
    return isNaN(precio) ? '0.00' : precio.toFixed(2);
  };

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    try {
      return new Date(fechaStr).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="devoluciones-container">
      <div className="headerTitle">
        <h2>DEVOLUCIONES</h2>
      </div>

      <div className="codigo-barras-container">
        <label htmlFor="codigoBarras">Código de Barras:</label>
        <input
          type="text"
          id="codigoBarras"
          name="codigoBarras"
          value={formData.codigoBarras}
          onChange={handleCodigoBarrasChange}
          onKeyDown={handleKeyDown}
          placeholder="Escanee o ingrese el código de barras"
        />
        <button onClick={buscarProductoVendido} className="btn-buscar">
          Buscar
        </button>
      </div>

      {formData.productoVendido && (
        <div className="producto-vendido-info">
          <h3>Información del Producto Vendido</h3>
          <table>
            <thead>
              <tr>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Color</th>
                <th>Talla</th>
                <th>Precio</th>
                <th>Fecha de Venta</th>
                <th>Vendedor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formData.productoVendido.MARCA || 'N/A'}</td>
                <td>{formData.productoVendido.MODELO || 'N/A'}</td>
                <td>{formData.productoVendido.COLOR || 'N/A'}</td>
                <td>{formData.productoVendido.TALLA || 'N/A'}</td>
                <td>${formatearPrecio(formData.productoVendido.PRECIO)}</td>
                <td>{formatearFecha(formData.productoVendido.VentasInfos?.FECHA_VENTA)}</td>
                <td>{formData.productoVendido.VentasInfos?.VENDEDOR || 'N/A'}</td>
              </tr>
            </tbody>
          </table>

          <div className="devolucion-opciones">
            <h4>Opciones de Devolución</h4>
            {/* Aquí irán las opciones de devolución */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Devoluciones;