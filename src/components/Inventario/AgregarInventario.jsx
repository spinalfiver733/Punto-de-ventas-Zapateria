import { useState, useEffect } from 'react';
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
  const [validandoCodigo, setValidandoCodigo] = useState(false);
  const [estadoCodigo, setEstadoCodigo] = useState(null); // null, 'valido', 'duplicado', 'error'
  const [mensajeValidacion, setMensajeValidacion] = useState('');

  const numeroOptions = [
    { value: '21.5', label: '21.5' },
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
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'AGREGAR',
      cancelButtonText: 'CANCELAR'
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

  // Función para verificar código de barras en la base de datos
  const verificarCodigoEnBD = async (codigoBarras) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/inventario/verificar-codigo/${codigoBarras}`);
      return response.data;
    } catch (error) {
      console.error('Error al verificar código:', error);
      return { existe: false };
    }
  };

  // Función para validar código de barras tanto local como en BD
  const validarCodigoBarras = async (codigoBarras, indexExcluir = null, mostrarMensaje = false) => {
    if (!codigoBarras || codigoBarras.trim() === '') {
      setEstadoCodigo(null);
      setMensajeValidacion('');
      return { valido: true };
    }

    // Verificar que tenga exactamente 6 dígitos para validación completa
    if (codigoBarras.length !== 6) {
      if (mostrarMensaje) {
        enqueueSnackbar('El código de barras debe tener exactamente 6 dígitos.', { variant: 'warning' });
      }
      return { valido: false, mensaje: 'El código debe tener 6 dígitos' };
    }

    // 1. Validar en la lista local (excluyendo el producto que se está editando)
    const duplicadoLocal = productosAgregar.find((producto, index) => 
      producto.codigo_barra === codigoBarras && index !== indexExcluir
    );

    if (duplicadoLocal) {
      const indice = productosAgregar.findIndex((producto, index) => 
        producto.codigo_barra === codigoBarras && index !== indexExcluir
      );
      const mensaje = `Ya está en la lista (Producto ${indice + 1}: ${duplicadoLocal.marca} ${duplicadoLocal.modelo} - ${duplicadoLocal.color})`;
      
      setEstadoCodigo('duplicado');
      setMensajeValidacion(mensaje);
      
      if (mostrarMensaje) {
        enqueueSnackbar(mensaje, { variant: 'error' });
      }
      
      return {
        valido: false,
        mensaje: mensaje
      };
    }

    // 2. Validar en la base de datos
    setValidandoCodigo(true);
    const resultadoBD = await verificarCodigoEnBD(codigoBarras);
    setValidandoCodigo(false);

    if (resultadoBD.existe) {
      const producto = resultadoBD.producto;
      const mensaje = `Ya existe en inventario: ${producto.MARCA} ${producto.MODELO} - ${producto.COLOR} (Talla: ${producto.TALLA})`;
      
      setEstadoCodigo('duplicado');
      setMensajeValidacion(mensaje);
      
      if (mostrarMensaje) {
        enqueueSnackbar(mensaje, { variant: 'error' });
      }
      
      return {
        valido: false,
        mensaje: mensaje
      };
    }

    // Si llegamos aquí, el código es válido
    setEstadoCodigo('valido');
    setMensajeValidacion('Código disponible');
    return { valido: true };
  };

  // Función para verificar duplicados en la lista actual (para mostrar en la tabla)
  const verificarDuplicadosEnLista = () => {
    const codigosContador = {};
    const duplicados = {};

    productosAgregar.forEach((producto, index) => {
      const codigo = producto.codigo_barra;
      if (!codigosContador[codigo]) {
        codigosContador[codigo] = [];
      }
      codigosContador[codigo].push(index);
    });

    Object.keys(codigosContador).forEach(codigo => {
      if (codigosContador[codigo].length > 1) {
        codigosContador[codigo].forEach(index => {
          duplicados[index] = true;
        });
      }
    });

    return duplicados;
  };

  // Effect para validar código en tiempo real (solo cuando tenga 6 dígitos)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const codigo = formData.codigo_barra?.trim();
      if (codigo && codigo.length === 6) {
        validarCodigoBarras(codigo, editingIndex, false);
      } else if (codigo && codigo.length > 0 && codigo.length < 6) {
        // Si tiene contenido pero menos de 6 dígitos, mostrar mensaje informativo
        setEstadoCodigo('incompleto');
        setMensajeValidacion(`Ingrese 6 dígitos (faltan ${6 - codigo.length})`);
      } else if (codigo.length === 0) {
        // Si está vacío, limpiar estado
        setEstadoCodigo(null);
        setMensajeValidacion('');
      }
    }, 300); // Reducido a 300ms para mejor UX

    return () => clearTimeout(timeoutId);
  }, [formData.codigo_barra, productosAgregar, editingIndex]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    // Limpiar estado de validación cuando se empieza a escribir un nuevo código
    if (name === 'codigo_barra') {
      setEstadoCodigo(null);
      setMensajeValidacion('');
    }
  };

  const handleSelectChange = (selectedOption) => {
    setFormData(prevState => ({
      ...prevState,
      numero: selectedOption
    }));
  };

  const handleAgregarALista = async () => {
    if (!formData.marca || !formData.modelo || !formData.numero || !formData.color || !formData.precio || !formData.codigo_barra) {
      enqueueSnackbar('Por favor, complete todos los campos.', { variant: 'warning' });
      return;
    }

    // Validar código de barras (con mensaje de error)
    const validacion = await validarCodigoBarras(formData.codigo_barra, editingIndex, true);
    
    if (!validacion.valido) {
      return; // El mensaje de error ya se mostró en la validación
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

    // Limpiar formulario
    setFormData({
      marca: '',
      modelo: '',
      numero: null,
      color: '',
      precio: '',
      codigo_barra: ''
    });
    
    // Limpiar estado de validación
    setEstadoCodigo(null);
    setMensajeValidacion('');
  };

  const handleEditar = (index) => {
    const productoAEditar = productosAgregar[index];
    setFormData({
      ...productoAEditar,
      numero: { value: productoAEditar.numero, label: productoAEditar.numero }
    });
    setEditingIndex(index);
    
    // Limpiar estado de validación
    setEstadoCodigo(null);
    setMensajeValidacion('');
  };

  const handleEliminar = async (index) => {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: "¿Desea eliminar este producto de la lista?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ELIMINAR',
      cancelButtonText: 'CANCELAR'
    });

    if (result.isConfirmed) {
      const nuevosProductos = productosAgregar.filter((_, i) => i !== index);
      setProductosAgregar(nuevosProductos);
      enqueueSnackbar('Producto eliminado de la lista.', { variant: 'success' });
      
      // Si estaba editando este producto, cancelar la edición
      if (editingIndex === index) {
        setEditingIndex(null);
        setFormData({
          marca: '',
          modelo: '',
          numero: null,
          color: '',
          precio: '',
          codigo_barra: ''
        });
        setEstadoCodigo(null);
        setMensajeValidacion('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (productosAgregar.length === 0) {
      enqueueSnackbar('No hay productos para agregar al inventario.', { variant: 'warning' });
      return;
    }

    // Verificar si hay duplicados en la lista antes de enviar
    const duplicados = verificarDuplicadosEnLista();
    if (Object.keys(duplicados).length > 0) {
      enqueueSnackbar('Hay códigos de barras duplicados en la lista. Por favor, revise y corrija antes de continuar.', { variant: 'error' });
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

  // Obtener duplicados para mostrar en la tabla
  const duplicadosEnLista = verificarDuplicadosEnLista();

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
              disabled={validandoCodigo}
              style={{
                borderColor: estadoCodigo === 'valido' ? '#4caf50' : 
                           estadoCodigo === 'duplicado' ? '#f44336' : 
                           estadoCodigo === 'incompleto' ? '#ff9800' : '',
                borderWidth: estadoCodigo ? '2px' : '1px'
              }}
            />
            {validandoCodigo && (
              <small style={{ color: '#666', fontSize: '12px' }}>
                Verificando código...
              </small>
            )}
            {mensajeValidacion && !validandoCodigo && (
              <small style={{ 
                color: estadoCodigo === 'valido' ? '#4caf50' : 
                       estadoCodigo === 'duplicado' ? '#f44336' : 
                       estadoCodigo === 'incompleto' ? '#ff9800' : '#666', 
                fontSize: '12px',
                display: 'block',
                marginTop: '4px'
              }}>
                {mensajeValidacion}
              </small>
            )}
          </div>        
        </div>
        <button 
          type="button" 
          className="btn-primary" 
          onClick={handleAgregarALista}
          disabled={validandoCodigo || estadoCodigo === 'duplicado' || estadoCodigo === 'incompleto'}
        >
          <img src={iconAgregar} alt="Agregar a la lista" />
          {editingIndex !== null ? 'ACTUALIZAR EN LA LISTA' : 'AGREGAR A LA LISTA'}
          {validandoCodigo && ' (Verificando...)'}
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
                <tr 
                  key={index}
                  style={{
                    backgroundColor: duplicadosEnLista[index] ? '#ffebee' : 'transparent'
                  }}
                >
                  <td>{producto.marca}</td>
                  <td>{producto.modelo}</td>
                  <td>{producto.color}</td>
                  <td>{producto.numero}</td>
                  <td>${parseFloat(producto.precio).toFixed(2)}</td>
                  <td>
                    <span style={{
                      color: duplicadosEnLista[index] ? '#f44336' : 'inherit',
                      fontWeight: duplicadosEnLista[index] ? 'bold' : 'normal'
                    }}>
                      {producto.codigo_barra}
                    </span>
                    {duplicadosEnLista[index] && (
                      <small style={{ 
                        color: '#f44336', 
                        fontSize: '11px',
                        display: 'block',
                        fontWeight: 'normal'
                      }}>
                        ⚠️ Duplicado
                      </small>
                    )}
                  </td>
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
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleSubmit}
            disabled={Object.keys(duplicadosEnLista).length > 0}
          >
            <img src={iconAgregar} alt="Agregar al inventario" />
            AGREGAR AL INVENTARIO
            {Object.keys(duplicadosEnLista).length > 0 && ' (Hay duplicados)'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AgregarInventario;