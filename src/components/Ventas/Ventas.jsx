import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import './Ventas.css';
import iconAgregar from '../../assets/images/svg/agregar.svg';

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? '#FF6E31' : '#ccc',
    boxShadow: state.isFocused ? '0 0 0 1px #FF6E31' : null,
    '&:hover': {
      borderColor: '#FF6E31',
    },
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#FFE6D9' : 'white',
    color: 'black',
    '&:hover': {
      backgroundColor: '#FFE6D9',
    },
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'black',
  }),
  input: (provided) => ({
    ...provided,
    color: 'black',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#757575',
  }),
};

const Ventas = () => {
  const [inventario, setInventario] = useState([]);
  const [modeloOptions, setModeloOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [numeroOptions, setNumeroOptions] = useState([]);
  const [vendedorOptions] = useState([
    { value: 'Vendedor 1', label: 'Vendedor 1' },
    { value: 'Vendedor 2', label: 'Vendedor 2' },
    { value: 'Vendedor 3', label: 'Vendedor 3' }
  ]);
  const [metodoPagoOptions] = useState([
    { value: 'Efectivo', label: 'Efectivo' },
    { value: 'Tarjeta', label: 'Tarjeta' },
    { value: 'Ambos', label: 'Ambos' }
  ]);

  const [formData, setFormData] = useState({
    modelo: null,
    productoId: null, // Añade esta línea
    color: null,
    numero: null,
    precio: '',
    vendedor: null,
    metodoPago: null,
    observaciones: ''
  });

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventario');
        setInventario(response.data);
        const uniqueModelos = [...new Set(response.data.map(item => item.MODELO))];
        setModeloOptions(uniqueModelos.map(modelo => ({ value: modelo, label: modelo })));
      } catch (error) {
        console.error('Error al obtener el inventario:', error);
      }
    };

    fetchInventario();
  }, []);

  const handleModeloChange = (selectedOption) => {
    const selectedProduct = inventario.find(item => item.MODELO === selectedOption.value);
      setFormData(prev => ({ 
        ...prev, 
        modelo: selectedOption, 
        productoId: selectedProduct ? selectedProduct.PK_PRODUCTO : null,
        color: null, 
        numero: null, 
        precio: '' 
    }));
    setFormData(prev => ({ ...prev, modelo: selectedOption, color: null, numero: null, precio: '' }));
    const modeloItems = inventario.filter(item => item.MODELO === selectedOption.value);
    const uniqueColores = [...new Set(modeloItems.map(item => item.COLOR))];
    setColorOptions(uniqueColores.map(color => ({ value: color, label: color })));
    setNumeroOptions([]);
  };

  const handleColorChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, color: selectedOption, numero: null, precio: '' }));
    const modeloColorItems = inventario.filter(item => 
      item.MODELO === formData.modelo.value && item.COLOR === selectedOption.value
    );
    const uniqueNumeros = [...new Set(modeloColorItems.map(item => item.TALLA))];
    setNumeroOptions(uniqueNumeros.map(numero => ({ value: numero, label: numero })));
  };

  const handleNumeroChange = (selectedOption) => {
    const selectedItem = inventario.find(item => 
      item.MODELO === formData.modelo.value && 
      item.COLOR === formData.color.value && 
      item.TALLA === selectedOption.value
    );
    setFormData(prev => ({ 
      ...prev, 
      numero: selectedOption, 
      precio: selectedItem ? selectedItem.PRECIO.toString() : ''
    }));
  };

  const handleSelectChange = (name) => (selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const ventaData = {
        FK_PRODUCTO: formData.productoId, // Usa el ID del producto
        VENDEDOR: formData.vendedor?.value,
        METODO_PAGO: formData.metodoPago?.value,
        OBSERVACIONES: formData.observaciones,
        PRECIO: formData.precio
      };
      console.log(ventaData);
      const response = await axios.post('http://localhost:5000/api/ventas', ventaData);
      console.log('Venta registrada:', response.data);
      // Aquí puedes agregar lógica adicional, como limpiar el formulario o mostrar un mensaje de éxito
    } catch (error) {
      console.error('Error al registrar la venta:', error);
      // Aquí puedes manejar el error, como mostrar un mensaje al usuario
    }
  };

  return (
    <div className="ventas-container">
      <div className="headerTitle">
        <h2>VENTAS</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="modelo">Modelo:</label>
            <Select
              id="modelo"
              value={formData.modelo}
              onChange={handleModeloChange}
              options={modeloOptions}
              isClearable
              isSearchable
              placeholder="Buscar modelo..."
              styles={customStyles}
            />
          </div>
          <div className="form-group">
            <label htmlFor="color">Color:</label>
            <Select
              id="color"
              value={formData.color}
              onChange={handleColorChange}
              options={colorOptions}
              isClearable
              isSearchable
              placeholder="Buscar color..."
              isDisabled={!formData.modelo}
              styles={customStyles}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="numero">Número:</label>
            <Select
              id="numero"
              value={formData.numero}
              onChange={handleNumeroChange}
              options={numeroOptions}
              isClearable
              isSearchable
              placeholder="Buscar número..."
              isDisabled={!formData.color}
              styles={customStyles}
            />
          </div>
          <div className="form-group">
            <label htmlFor="precio">Precio:</label>
            <input 
              type="text" 
              id="precio" 
              name="precio" 
              value={formData.precio} 
              onChange={handleChange}
              disabled={!formData.numero}
            />
          </div>
        </div>
        <div className="form-row">
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
              styles={customStyles}
            />
          </div>
          <div className="form-group">
            <label htmlFor="metodoPago">Método de pago:</label>
            <Select
              id="metodoPago"
              value={formData.metodoPago}
              onChange={handleSelectChange('metodoPago')}
              options={metodoPagoOptions}
              isClearable
              isSearchable
              placeholder="Seleccionar método de pago..."
              styles={customStyles}
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
              onChange={handleChange}
              placeholder="Escribe aquí la observación"
            ></textarea>
          </div>
        </div>
        <button type="submit" className="btn-agregar">
          <img src={iconAgregar} alt="Agregar producto" />
          REGISTRAR VENTA
        </button>
      </form>
    </div>
  );
};

export default Ventas;