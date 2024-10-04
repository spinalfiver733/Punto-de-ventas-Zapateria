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
  const [marcaOptions, setMarcaOptions] = useState([]);
  const [modeloOptions, setModeloOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [numeroOptions, setNumeroOptions] = useState([]);
  const [productosAgregados, setProductosAgregados] = useState([]);
  const [vendedorOptions] = useState([
    { value: 'Vendedor 1', label: 'Vendedor 1' },
    { value: 'Vendedor 2', label: 'Vendedor 2' },
    { value: 'Vendedor 3', label: 'Vendedor 3' }
  ]);
  const [metodoPagoOptions, setMetodoPagoOptions] = useState([]);

  const [formData, setFormData] = useState({
    marca: null,
    modelo: null,
    productoId: null,
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
        const inventarioDisponible = response.data.filter(item => item.FK_ESTATUS_PRODUCTO === 1); // 1 es "En inventario"
        setInventario(inventarioDisponible);
        const uniqueMarcas = [...new Set(inventarioDisponible.map(item => item.MARCA))];
        setMarcaOptions(uniqueMarcas.map(marca => ({ value: marca, label: marca })));
      } catch (error) {
        console.error('Error al obtener el inventario:', error);
      }
    };

    const fetchMetodosPago = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/metodosPago');
        setMetodoPagoOptions(response.data.map(metodo => ({
          value: metodo.PK_METODO,
          label: metodo.DESCRIPCION_METODO
        })));
      } catch (error) {
        console.error('Error al obtener los métodos de pago:', error);
      }
    };

    fetchInventario();
    fetchMetodosPago();
  }, []);

  const handleMarcaChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, marca: selectedOption, modelo: null, color: null, numero: null, precio: '' }));
    const marcaItems = inventario.filter(item => item.MARCA === selectedOption.value);
    const uniqueModelos = [...new Set(marcaItems.map(item => item.MODELO))];
    setModeloOptions(uniqueModelos.map(modelo => ({ value: modelo, label: modelo })));
    setColorOptions([]);
    setNumeroOptions([]);
  };

  const handleModeloChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, modelo: selectedOption, color: null, numero: null, precio: '' }));
    const modeloItems = inventario.filter(item => 
      item.MARCA === formData.marca.value && item.MODELO === selectedOption.value
    );
    const uniqueColores = [...new Set(modeloItems.map(item => item.COLOR))];
    setColorOptions(uniqueColores.map(color => ({ value: color, label: color })));
    setNumeroOptions([]);
  };

  const handleColorChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, color: selectedOption, numero: null, precio: '' }));
    const colorItems = inventario.filter(item => 
      item.MARCA === formData.marca.value && 
      item.MODELO === formData.modelo.value && 
      item.COLOR === selectedOption.value
    );
    const uniqueNumeros = [...new Set(colorItems.map(item => item.TALLA))];
    setNumeroOptions(uniqueNumeros.map(numero => ({ value: numero, label: numero })));
  };

  const handleNumeroChange = (selectedOption) => {
    const selectedItem = inventario.find(item => 
      item.MARCA === formData.marca.value &&
      item.MODELO === formData.modelo.value && 
      item.COLOR === formData.color.value && 
      item.TALLA === selectedOption.value
    );
    setFormData(prev => ({ 
      ...prev, 
      numero: selectedOption, 
      precio: selectedItem ? selectedItem.PRECIO.toString() : '',
      productoId: selectedItem ? selectedItem.PK_PRODUCTO : null
    }));
  };

  const handleSelectChange = (name) => (selectedOption) => {
    setFormData(prev => ({ ...prev, [name]: selectedOption }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAgregarProducto = async () => {
    if (!formData.marca || !formData.modelo || !formData.color || !formData.numero || !formData.precio) {
      alert('Por favor, complete todos los campos del producto');
      return;
    }
    try {
      // Actualizar el estado del producto a "En venta"
      await axios.put(`http://localhost:5000/api/inventario/${formData.productoId}`, {
        FK_ESTATUS_PRODUCTO: 3 // 3 es el estado "En venta"
      });
  
      const nuevoProducto = {
        marca: formData.marca.value,
        modelo: formData.modelo.value,
        color: formData.color.value,
        numero: formData.numero.value,
        precio: formData.precio,
        vendedor: formData.vendedor?.value || '',
        metodoPago: formData.metodoPago ? formData.metodoPago.label : '',
        observaciones: formData.observaciones,
        productoId: formData.productoId
      };
  
      setProductosAgregados([...productosAgregados, nuevoProducto]);
  
      // Actualizar el inventario en el estado
      setInventario(prevInventario => 
        prevInventario.filter(item => item.PK_PRODUCTO !== formData.productoId)
      );
  
      // Limpiar los campos del formulario después de agregar
      setFormData({
        marca: null,
        modelo: null,
        color: null,
        numero: null,
        precio: '',
        productoId: null,
        observaciones: '',
        metodoPago: null,
        vendedor: null
      });
  
      // Actualizar las opciones disponibles
      actualizarOpciones();
  
    } catch (error) {
      console.error('Error al actualizar el estado del producto:', error);
      alert('Error al agregar el producto a la venta');
    }
  };

  const actualizarOpciones = () => {
    const inventarioActualizado = inventario.filter(item => !productosAgregados.some(p => p.productoId === item.PK_PRODUCTO));
    const uniqueMarcas = [...new Set(inventarioActualizado.map(item => item.MARCA))];
    setMarcaOptions(uniqueMarcas.map(marca => ({ value: marca, label: marca })));
    setModeloOptions([]);
    setColorOptions([]);
    setNumeroOptions([]);
  };

  const handleFinalizarVenta = async () => {
    if (productosAgregados.length === 0) {
      alert('Debe agregar al menos un producto a la venta');
      return;
    }
    try {
      console.log('Iniciando proceso de finalización de venta');
      
      // Verificar la disponibilidad de cada producto antes de finalizar la venta
      for (const producto of productosAgregados) {
        try {
          console.log(`Verificando producto ${producto.productoId}`);
          const response = await axios.get(`http://localhost:5000/api/inventario/${producto.productoId}`);
          console.log(`Respuesta de verificación:`, response.data);
          if (response.data.FK_ESTATUS_PRODUCTO !== 3) { // 3 es el estado "En venta"
            throw new Error(`El producto ${producto.productoId} no está en estado de venta.`);
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            console.log(`Producto ${producto.productoId} no encontrado en el inventario, asumiendo que está en estado de venta.`);
            // Continuamos con la venta asumiendo que el producto está en estado de venta
            continue;
          }
          throw error;
        }
      }
  
      const primerProducto = productosAgregados[0];
      const ventaData = {
        VENDEDOR: primerProducto.vendedor,
        METODO_PAGO: metodoPagoOptions.find(option => option.label === primerProducto.metodoPago)?.value,
        OBSERVACIONES: primerProducto.observaciones,
        productos: productosAgregados.map(producto => ({
          FK_PRODUCTO: producto.productoId,
          PRECIO: producto.precio,
          OBSERVACIONES: producto.observaciones
        }))
      };
  
      console.log('Datos que se están enviando:', JSON.stringify(ventaData, null, 2));
      
      const response = await axios.post('http://localhost:5000/api/ordenes', ventaData);
      console.log('Respuesta del servidor:', response.data);
  
      setProductosAgregados([]);
      // Actualizar el inventario
      const inventarioActualizado = await axios.get('http://localhost:5000/api/inventario');
      setInventario(inventarioActualizado.data.filter(item => item.FK_ESTATUS_PRODUCTO === 1));
      actualizarOpciones();
  
      // Limpiar el formulario completamente
      setFormData({
        marca: null,
        modelo: null,
        color: null,
        numero: null,
        precio: '',
        productoId: null,
        vendedor: null,
        metodoPago: null,
        observaciones: ''
      });
  
      alert('Venta registrada con éxito');
    } catch (error) {
      console.error('Error al finalizar la venta:', error);
      if (error.response) {
        console.error('Datos de la respuesta de error:', error.response.data);
        console.error('Estado de la respuesta de error:', error.response.status);
        console.error('Cabeceras de la respuesta de error:', error.response.headers);
      } else if (error.request) {
        console.error('No se recibió respuesta del servidor');
      } else {
        console.error('Error al configurar la solicitud:', error.message);
      }
      alert('Error al registrar la venta: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancelarCompra = async () => {
    if (productosAgregados.length === 0) {
      alert('No hay productos agregados para cancelar');
      return;
    }

    try {
      // Devolver los productos al estado "En inventario" (estado 1)
      for (const producto of productosAgregados) {
        await axios.put(`http://localhost:5000/api/inventario/${producto.productoId}`, {
          FK_ESTATUS_PRODUCTO: 1 // 1 es el estado "En inventario"
        });
      }

      // Limpiar la lista de productos agregados
      setProductosAgregados([]);

      // Actualizar el inventario
      const inventarioActualizado = await axios.get('http://localhost:5000/api/inventario');
      setInventario(inventarioActualizado.data.filter(item => item.FK_ESTATUS_PRODUCTO === 1));
      actualizarOpciones();

      // Limpiar el formulario
      setFormData({
        marca: null,
        modelo: null,
        color: null,
        numero: null,
        precio: '',
        productoId: null,
        vendedor: null,
        metodoPago: null,
        observaciones: ''
      });

      alert('Compra cancelada. Los productos han sido devueltos al inventario.');
    } catch (error) {
      console.error('Error al cancelar la compra:', error);
      alert('Error al cancelar la compra: ' + error.message);
    }
  };

  return (
    <div className="ventas-container">
      <div className="headerTitle">
        <h2>VENTAS</h2>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="marca">Marca:</label>
            <Select
              id="marca"
              value={formData.marca}
              onChange={handleMarcaChange}
              options={marcaOptions}
              isClearable
              isSearchable
              placeholder="Buscar marca..."
              styles={customStyles}
            />
          </div>
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
              isDisabled={!formData.marca}
              styles={customStyles}
            />
          </div>
        </div>
        <div className="form-row">
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
              styles={customStyles}
            />
          </div>
        </div>
        <div className="form-row">
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
        <button type="button" className="btn-agregar" onClick={handleAgregarProducto}>
          <img src={iconAgregar} alt="Agregar producto" />
          AGREGAR
        </button>
      </form>
  
      {productosAgregados.length > 0 && (
        <div className="productos-agregados">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Color</th>
                <th>Número</th>
                <th>Vendedor</th>
                <th>Método de pago</th>
                <th>Observaciones</th>
                <th>Precio</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {productosAgregados.map((producto, index) => {
                const precioNumerico = parseFloat(producto.precio);
                const totalAcumulado = productosAgregados
                  .slice(0, index + 1)
                  .reduce((sum, p) => sum + parseFloat(p.precio), 0);
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{producto.marca}</td>
                    <td>{producto.modelo}</td>
                    <td>{producto.color}</td>
                    <td>{producto.numero}</td>
                    <td>{producto.vendedor}</td>
                    <td>{producto.metodoPago}</td>
                    <td>{producto.observaciones}</td>
                    <td>${precioNumerico.toFixed(2)}</td>
                    <td>${totalAcumulado.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="total-row">
            <span className="total-label">Total General:</span>
            <span className="total-amount">
              ${productosAgregados.reduce((sum, producto) => sum + parseFloat(producto.precio), 0).toFixed(2)}
            </span>
          </div>
          <div className="buttons-container">
            <button className="btn-finalizar-venta" onClick={handleFinalizarVenta}>
              FINALIZAR VENTA
            </button>
            <button className="btn-cancelar-compra" onClick={handleCancelarCompra}>
                CANCELAR COMPRA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas;