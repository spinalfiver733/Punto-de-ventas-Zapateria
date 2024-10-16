//Importaciones react
import { useState, useEffect, useCallback } from 'react';

//Estilos
import './Ventas.css';
import { useVenta } from '../../context/VentaContext';
import { customSelectStyles } from '../../styles/estilosGenerales';

//Importación de imagenes
import iconAgregar from '../../assets/images/svg/agregar.svg';
import iconCancelar from '../../assets/images/svg/aceptar.svg';
import iconAceptar from '../../assets/images/svg/cancelar.svg';
import iconDevolucion from '../../assets/images/svg/iconoDevolucionNaranja.svg';

//Importación de librerias
import { useSnackbar } from 'notistack';
import axios from 'axios';
import Select from 'react-select';

const Ventas = ({ onCancelVenta }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { iniciarVenta, finalizarVenta } = useVenta();
  const [marcaOptions, setMarcaOptions] = useState([]);
  const [modeloOptions, setModeloOptions] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [numeroOptions, setNumeroOptions] = useState([]);
  const [productosAgregados, setProductosAgregados] = useState([]);
  const [vendedorOptions, setVendedorOptions] = useState([]);
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
  const [inventarioDisponible, setInventarioDisponible] = useState([]);

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/inventario');
        const inventarioDisponible = response.data.filter(item => item.FK_ESTATUS_PRODUCTO === 1);
        setInventarioDisponible(inventarioDisponible);
        actualizarOpcionesMarca(inventarioDisponible);
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

    const fetchVendedor = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/usuarios');
        const vendedores = response.data.map(vendedor => ({
          value: vendedor.ID_USUARIO,
          label: `${vendedor.NOMBRE_USUARIO}`
        }));
        setVendedorOptions(vendedores);
        console.log('Opciones de vendedor cargadas:', vendedores);
      } catch (error) {
        console.log('Error al obtener los vendedores', error);
      }
    }

    fetchInventario();
    fetchMetodosPago();
    fetchVendedor();
  }, []);

  const actualizarOpcionesMarca = useCallback((inventario) => {
    const uniqueMarcas = [...new Set(inventario.map(item => item.MARCA))];
    setMarcaOptions(uniqueMarcas.map(marca => ({ value: marca, label: marca })));
  }, []);

  const handleMarcaChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, marca: selectedOption, modelo: null, color: null, numero: null, precio: '' }));
    const marcaItems = inventarioDisponible.filter(item => item.MARCA === selectedOption.value);
    const uniqueModelos = [...new Set(marcaItems.map(item => item.MODELO))];
    setModeloOptions(uniqueModelos.map(modelo => ({ value: modelo, label: modelo })));
    setColorOptions([]);
    setNumeroOptions([]);
  };

  const handleModeloChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, modelo: selectedOption, color: null, numero: null, precio: '' }));
    const modeloItems = inventarioDisponible.filter(item => 
      item.MARCA === formData.marca.value && item.MODELO === selectedOption.value
    );
    const uniqueColores = [...new Set(modeloItems.map(item => item.COLOR))];
    setColorOptions(uniqueColores.map(color => ({ value: color, label: color })));
    setNumeroOptions([]);
  };

  const handleColorChange = (selectedOption) => {
    setFormData(prev => ({ ...prev, color: selectedOption, numero: null, precio: '' }));
    const colorItems = inventarioDisponible.filter(item => 
      item.MARCA === formData.marca.value && 
      item.MODELO === formData.modelo.value && 
      item.COLOR === selectedOption.value
    );
    const uniqueNumeros = [...new Set(colorItems.map(item => item.TALLA))];
    setNumeroOptions(uniqueNumeros.map(numero => ({ value: numero, label: numero })));
  };

  const handleNumeroChange = (selectedOption) => {
    const selectedItem = inventarioDisponible.find(item => 
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
    console.log(`Cambiando ${name}:`, selectedOption);
    setFormData(prev => {
      const newState = { ...prev, [name]: selectedOption };
      console.log('Nuevo estado de formData:', newState);
      return newState;
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAgregarProducto = async () => {
    if (!formData.marca || !formData.modelo || !formData.color || !formData.numero || !formData.precio) {
      enqueueSnackbar('Por favor, complete todos los campos del producto', { variant: 'warning' });
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/inventario/${formData.productoId}`, {
        FK_ESTATUS_PRODUCTO: 3
      });
      const nuevoProducto = {
        marca: formData.marca.value,
        modelo: formData.modelo.value,
        color: formData.color.value,
        numero: formData.numero.value,
        precio: formData.precio,
        vendedor: formData.vendedor?.value,
        metodoPago: formData.metodoPago ? formData.metodoPago.label : '',
        observaciones: formData.observaciones,
        productoId: formData.productoId
      };
      console.log('Nuevo producto a agregar:', nuevoProducto);
      console.log('Estado actual de formData:', formData);
      setProductosAgregados(prev => {
        const nuevosProductos = [...prev, nuevoProducto];
        console.log('Productos agregados actualizados:', nuevosProductos);
        return nuevosProductos;
      });
      
      const nuevoInventarioDisponible = inventarioDisponible.filter(item => item.PK_PRODUCTO !== formData.productoId);
      setInventarioDisponible(nuevoInventarioDisponible);
      actualizarOpcionesMarca(nuevoInventarioDisponible);

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

      enqueueSnackbar('Producto agregado a la venta', { variant: 'success' });
    } catch (error) {
      console.error('Error al actualizar el estado del producto:', error);
      enqueueSnackbar('Error al agregar el producto a la venta', { variant: 'error' });
    }
    iniciarVenta();
  };

  const handleFinalizarVenta = async () => {
    if (productosAgregados.length === 0) {
      enqueueSnackbar('Debe agregar al menos un producto a la venta', { variant: 'warning' });
      return;
    }
    try {
      console.log('Iniciando proceso de finalización de venta');
      console.log('Estado actual de formData:', formData);
      console.log('Productos agregados:', productosAgregados);
  
      const primerProducto = productosAgregados[0];
      console.log('Primer producto:', primerProducto);
  
      const ventaData = {
        VENDEDOR: primerProducto.vendedor || formData.vendedor?.value || null,
        METODO_PAGO: metodoPagoOptions.find(option => option.label === primerProducto.metodoPago)?.value,
        OBSERVACIONES: primerProducto.observaciones,
        productos: productosAgregados.map(producto => ({
          FK_PRODUCTO: producto.productoId,
          PRECIO: producto.precio,
          OBSERVACIONES: producto.observaciones,
          MARCA: producto.marca,
          TALLA: producto.numero, 
          MODELO: producto.modelo,
          COLOR: producto.color
        }))
      };
      console.log('Datos que se están enviando:', JSON.stringify(ventaData, null, 2));
      const response = await axios.post('http://localhost:5000/api/ordenes', ventaData);
      console.log('Respuesta del servidor:', response.data);
      setProductosAgregados([]);
      const inventarioActualizado = await axios.get('http://localhost:5000/api/inventario');
      const nuevoInventarioDisponible = inventarioActualizado.data.filter(item => item.FK_ESTATUS_PRODUCTO === 1);
      setInventarioDisponible(nuevoInventarioDisponible);
      actualizarOpcionesMarca(nuevoInventarioDisponible);
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
      enqueueSnackbar('Venta registrada con éxito', { variant: 'success' });
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
      enqueueSnackbar('Error al registrar la venta: ' + (error.response?.data?.message || error.message), { variant: 'error' });
    }
    finalizarVenta();
  };

  const handleCancelarCompra = useCallback(async () => {
    if (productosAgregados.length === 0) {
      enqueueSnackbar('No hay productos agregados para cancelar', { variant: 'error' });
      return;
    }
    try {
      for (const producto of productosAgregados) {
        await axios.put(`http://localhost:5000/api/inventario/${producto.productoId}`, {
          FK_ESTATUS_PRODUCTO: 1
        });
      }
      
      const inventarioActualizado = await axios.get('http://localhost:5000/api/inventario');
      const nuevoInventarioDisponible = inventarioActualizado.data.filter(item => item.FK_ESTATUS_PRODUCTO === 1);
      setInventarioDisponible(nuevoInventarioDisponible);
      actualizarOpcionesMarca(nuevoInventarioDisponible);

      setProductosAgregados([]);
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
      enqueueSnackbar('Compra cancelada. Los productos han sido devueltos al inventario.', { variant: 'info' });
      finalizarVenta();
    } catch (error) {
      console.error('Error al cancelar la compra:', error);
      enqueueSnackbar('Error al cancelar la compra: ' + error.message, { variant: 'error' });
    }
  }, [productosAgregados, enqueueSnackbar, finalizarVenta, actualizarOpcionesMarca]);

  useEffect(() => {
    onCancelVenta(handleCancelarCompra);
  }, [onCancelVenta, handleCancelarCompra]);

  // El return con el JSX se omite aquí, ya que lo tienes en tu código original
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
              styles={customSelectStyles}
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
              onChange={handleColorChange}
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
              onChange={handleNumeroChange}
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
              styles={customSelectStyles}
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
      <div className="contenedorDevolucion">
        <img 
          src={iconDevolucion} 
          alt="Realizar devolución" 
          className="devolucionImg"  // Añades una clase personalizada
          // onClick={handleDevolucionClick}  // Descomentar cuando se defina la función
          style={{ cursor: 'pointer' }}  // Esto añade un cursor de mano para indicar que es clickeable
        />
      </div>


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
                    <td>{producto.vendedor ? vendedorOptions.find(v => v.value === producto.vendedor)?.label : ''}</td>
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
            <img src={iconAceptar} alt="Finalizar venta" />
              FINALIZAR VENTA
            </button>
            <button className="btn-cancelar-compra" onClick={handleCancelarCompra}>
            <img src={iconCancelar} alt="Cancelar venta" />
                CANCELAR VENTA
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas;