import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import './Devoluciones.css';
import { customSelectStyles } from '../../styles/estilosGenerales';

const Devoluciones = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [marcaOptions, setMarcaOptions] = useState([]);
  const [modeloOptions, setModeloOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [numeroOptions, setNumeroOptions] = useState([]);
  const [vendedorOptions, setVendedorOptions] = useState([]);
  const [formData, setFormData] = useState({
    codigoBarras: '',
    marca: null,
    modelo: null,
    productoId: null,
    color: null,
    numero: null,
    precio: '',
    vendedor: null,
    observaciones: ''
  });

  useEffect(() => {
    // Aquí irían las llamadas a la API para obtener las opciones iniciales
    // Por ejemplo:
    const fetchOptions = async () => {
      try {
        const [inventarioResponse, vendedoresResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/inventario'),
          axios.get('http://localhost:5000/api/usuarios')
        ]);

        const inventario = inventarioResponse.data;
        const vendedores = vendedoresResponse.data;

        // Procesar opciones de marca
        const uniqueMarcas = [...new Set(inventario.map(item => item.MARCA))];
        setMarcaOptions(uniqueMarcas.map(marca => ({ value: marca, label: marca })));

        // Procesar opciones de vendedor
        setVendedorOptions(vendedores.map(vendedor => ({
          value: vendedor.ID_USUARIO,
          label: `${vendedor.NOMBRE_USUARIO}`
        })));

      } catch (error) {
        console.error('Error al obtener datos iniciales:', error);
        enqueueSnackbar('Error al cargar datos iniciales', { variant: 'error' });
      }
    };

    fetchOptions();
  }, [enqueueSnackbar]);

  const handleCodigoBarrasChange = (e) => {
    const codigoBarras = e.target.value;
    setFormData(prev => ({ ...prev, codigoBarras }));
    // Aquí iría la lógica para buscar el producto por código de barras
  };

  const handleSelectChange = (name) => (selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption }));
    // Aquí iría la lógica para actualizar las opciones dependientes
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          placeholder="Escanee o ingrese el código de barras"
        />
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="marca">Marca:</label>
            <Select
              id="marca"
              value={formData.marca}
              onChange={handleSelectChange('marca')}
              options={marcaOptions}
              isClearable
              isSearchable
              placeholder="Buscar marca..."
              styles={customSelectStyles}
            />
          </div>
          <div className="form-group">
            <label htmlFor="modelo">Modelo:</label>
            <Select
              id="modelo"
              value={formData.modelo}
              onChange={handleSelectChange('modelo')}
              options={modeloOptions}
              isClearable
              isSearchable
              placeholder="Buscar modelo..."
              isDisabled={!formData.marca}
              styles={customSelectStyles}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="color">Color:</label>
            <Select
              id="color"
              value={formData.color}
              onChange={handleSelectChange('color')}
              options={colorOptions}
              isClearable
              isSearchable
              placeholder="Buscar color..."
              isDisabled={!formData.modelo}
              styles={customSelectStyles}
            />
          </div>          
          <div className="form-group">
            <label htmlFor="numero">Número:</label>
            <Select
              id="numero"
              value={formData.numero}
              onChange={handleSelectChange('numero')}
              options={numeroOptions}
              isClearable
              isSearchable
              placeholder="Buscar número..."
              isDisabled={!formData.color}
              styles={customSelectStyles}
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
              onChange={handleInputChange}
              disabled={!formData.numero}
            />
          </div>
          <div className="form-group">
            <label htmlFor="vendedor">Vendedor:</label>
            <Select
              id="vendedor"
              value={formData.vendedor}
              onChange={handleSelectChange('vendedor')}
              options={vendedorOptions}
              isClearable
              isSearchable
              placeholder="Seleccionar vendedor..."
              styles={customSelectStyles}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group textarea">
            <label htmlFor="observaciones">Observaciones:</label>
            <textarea 
              id="observaciones" 
              name="observaciones" 
              rows="4" 
              cols="50" 
              value={formData.observaciones}
              onChange={handleInputChange}
              placeholder="Escribe aquí la observación"
            ></textarea>
          </div>
        </div>
        {/* Aquí puedes agregar botones para procesar la devolución */}
      </form>
    </div>
  );
};

export default Devoluciones;