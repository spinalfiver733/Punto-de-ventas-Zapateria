import { useState } from 'react';
import './AgregarInventario.css';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import Select from 'react-select';
import Swal from 'sweetalert2';
import iconAgregar from '../../assets/images/svg/agregar.svg';
import iconEditar from '../../assets/images/svg/editar.svg';
import iconEliminar from '../../assets/images/svg/eliminar.svg';
import { customSelectStyles } from '../../styles/estilosGenerales';

const AgregarInventario = ({ onProductoAgregado }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    marca: '',
    modelo: '',
    numero: null,
    color: '',
    precio: '',
    codigo_barra: ''
  });
  const [productosAgregar, setProductosAgregar] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  const numeroOptions = [
    { value: '21', label: '21' },
    { value: '22', label: '22' },
    { value: '23', label: '23' },
    { value: '35', label: '35' },
    { value: '36', label: '36' },
    { value: '37', label: '37' },
  ];

  const mostrarConfirmacion = async (titulo, texto) => {
    return Swal.fire({
      title: titulo,
      text: texto,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, agregar',
      cancelButtonText: 'Cancelar'
    });
  };

  const mostrarError = async (titulo, texto) => {
    return Swal.fire({
      title: titulo,
      text: texto,
      icon: 'error',
      confirmButtonColor: '#3085d6',
    });
  };

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

  const handleAgregarALista = () => {
    if (!formData.marca || !formData.modelo || !formData.numero || !formData.color || !formData.precio || !formData.codigo_barra) {
      enqueueSnackbar('Por favor, complete todos los campos.', { variant: 'warning' });
      return;
    }

    const nuevoProducto = {
      ...formData,
      numero: formData.numero.value,
    };

    if (editingIndex !== null) {
      // Actualizar producto existente
      const nuevosProductos = [...productosAgregar];
      nuevosProductos[editingIndex] = nuevoProducto;
      setProductosAgregar(nuevosProductos);
      setEditingIndex(null);
      enqueueSnackbar('Producto actualizado en la lista.', { variant: 'success' });
    } else {
      // Agregar nuevo producto
      setProductosAgregar(prevState => [...prevState, nuevoProducto]);
      enqueueSnackbar('Producto agregado a la lista.', { variant: 'success' });
    }

    setFormData({
      marca: '',
      modelo: '',
      numero: null,
      color: '',
      precio: '',
      codigo_barra: ''
    });
  };

  const handleEditar = (index) => {
    const productoAEditar = productosAgregar[index];
    setFormData({
      ...productoAEditar,
      numero: { value: productoAEditar.numero, label: productoAEditar.numero }
    });
    setEditingIndex(index);
  };

  const handleEliminar = async (index) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "¿Desea eliminar este producto de la lista?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      const nuevosProductos = productosAgregar.filter((_, i) => i !== index);
      setProductosAgregar(nuevosProductos);
      enqueueSnackbar('Producto eliminado de la lista.', { variant: 'success' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (productosAgregar.length === 0) {
      enqueueSnackbar('No hay productos para agregar al inventario.', { variant: 'warning' });
      return;
    }

    const result = await mostrarConfirmacion(
      '¿Está seguro?',
      `¿Desea agregar ${productosAgregar.length} producto(s) al inventario?`
    );

    if (result.isConfirmed) {
      try {
        for (const producto of productosAgregar) {
          const response = await axios.post('http://localhost:5000/api/inventario', producto);
          console.log('Respuesta completa:', response);
        }
        enqueueSnackbar('Los productos han sido agregados al inventario.', { variant: 'success' });
        setProductosAgregar([]);
        onProductoAgregado();
      } catch (error) {
        console.error('Error al agregar productos:', error);
        await mostrarError('Error', 'Ha ocurrido un error al agregar los productos al inventario. Por favor, inténtelo de nuevo.');
      }
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
              placeholder="Ingrese el precio del producto"
              required
            />
          </div>  
          <div className="form-group">
            <label htmlFor="codigo_barra">Código de Barras:</label>
            <input 
              type="text" 
              id="codigo_barra" 
              name="codigo_barra" 
              value={formData.codigo_barra} 
              onChange={handleChange} 
              placeholder="Escanea o ingresa el código"
              required
            />
          </div>        
        </div>
        <button type="button" className="btn-primary" onClick={handleAgregarALista}>
          <img src={iconAgregar} alt="Agregar a la lista" />
          {editingIndex !== null ? 'ACTUALIZAR EN LA LISTA' : 'AGREGAR A LA LISTA'}
        </button>
      </form>

      {productosAgregar.length > 0 && (
        <div className="productos-agregados">
          <table>
            <thead>
              <tr>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Color</th>
                <th>Número</th>
                <th>Precio</th>
                <th>Código de Barras</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosAgregar.map((producto, index) => (
                <tr key={index}>
                  <td>{producto.marca}</td>
                  <td>{producto.modelo}</td>
                  <td>{producto.color}</td>
                  <td>{producto.numero}</td>
                  <td>${parseFloat(producto.precio).toFixed(2)}</td>
                  <td>{producto.codigo_barra}</td>
                  <td>
                    <button onClick={() => handleEditar(index)} className="btn-accion">
                      <img src={iconEditar} alt="Editar" />
                    </button>
                    <button onClick={() => handleEliminar(index)} className="btn-accion">
                      <img src={iconEliminar} alt="Eliminar" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" className="btn-primary" onClick={handleSubmit}>
            <img src={iconAgregar} alt="Agregar al inventario" />
            AGREGAR AL INVENTARIO
          </button>
        </div>
      )}
    </div>
  );
};

export default AgregarInventario;