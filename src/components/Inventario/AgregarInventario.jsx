import { useState, useEffect } from 'react';
import './AgregarInventario.css';
import { useSnackbar } from 'notistack';
import Select from 'react-select';
import Swal from 'sweetalert2';
import iconAgregar from '../../assets/images/svg/agregar.svg';
import iconEditar from '../../assets/images/svg/editar.svg';
import iconEliminar from '../../assets/images/svg/eliminar.svg';
import { customSelectStyles } from '../../styles/estilosGenerales';
import api from '../../config/api.js';

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
  const [estadoCodigo, setEstadoCodigo] = useState(null);
  const [mensajeValidacion, setMensajeValidacion] = useState('');

  // Estados para corridas
  const [mostrarCorridas, setMostrarCorridas] = useState(false);
  const [corridaData, setCorridaData] = useState({
    marca: '',
    modelo: '',
    color: '',
    precio: '',
    numeroInicio: '',
    numeroFin: '',
    incremento: '1' // '1' para enteros, '0.5' para medios
  });
  const [productosCorreida, setProductosCorreida] = useState([]);
  
  // NUEVO: Estado para validaciones de códigos en corridas
  const [validacionesCorrida, setValidacionesCorrida] = useState({});
  const [validandosCorrida, setValidandosCorrida] = useState({});

  const numeroOptions = [];

  for (let i = 10; i <= 27; i += 0.5) {
    numeroOptions.push({
      value: i.toString(),
      label: i.toString()
    });
  }

  const incrementoOptions = [
    { value: '1', label: 'Números enteros (22, 23, 24, 25...)' },
    { value: '0.5', label: 'Números medios (22, 22.5, 23, 23.5...)' }
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
      console.log('🔍 Verificando código en BD:', codigoBarras);
      const response = await api.get(`/api/inventario/verificar-codigo/${codigoBarras}`);
      console.log('📋 Respuesta de BD:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al verificar código:', error);
      return { existe: false, error: true };
    }
  };

  // Función para validar código de barras tanto local como en BD
  const validarCodigoBarras = async (codigoBarras, indexExcluir = null, mostrarMensaje = false) => {
    if (!codigoBarras || codigoBarras.trim() === '') {
      setEstadoCodigo(null);
      setMensajeValidacion('');
      return { valido: true };
    }

    if (codigoBarras.length !== 6) {
      setEstadoCodigo('incompleto');
      setMensajeValidacion(`Ingrese 6 dígitos (faltan ${6 - codigoBarras.length})`);
      if (mostrarMensaje) {
        enqueueSnackbar('El código de barras debe tener exactamente 6 dígitos.', { variant: 'warning' });
      }
      return { valido: false, mensaje: 'El código debe tener 6 dígitos' };
    }

    // Validar en la lista local
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

      return { valido: false, mensaje: mensaje };
    }

    // Validar en la base de datos
    setValidandoCodigo(true);
    const resultadoBD = await verificarCodigoEnBD(codigoBarras);
    setValidandoCodigo(false);

    if (resultadoBD.error) {
      setEstadoCodigo('valido');
      setMensajeValidacion('Código disponible (error de conexión)');
      return { valido: true };
    }

    if (resultadoBD.existe) {
      const producto = resultadoBD.producto;
      const mensaje = `Ya existe en inventario: ${producto.MARCA} ${producto.MODELO} - ${producto.COLOR} (Talla: ${producto.TALLA})`;

      setEstadoCodigo('duplicado');
      setMensajeValidacion(mensaje);

      if (mostrarMensaje) {
        enqueueSnackbar(mensaje, { variant: 'error' });
      }

      return { valido: false, mensaje: mensaje };
    }

    setEstadoCodigo('valido');
    setMensajeValidacion('Código disponible');
    return { valido: true };
  };

  // NUEVA: Función para validar código en corridas
  const validarCodigoEnCorrida = async (codigoBarras, indexCorrida) => {
    if (!codigoBarras || codigoBarras.trim() === '') {
      setValidacionesCorrida(prev => {
        const nuevas = { ...prev };
        delete nuevas[indexCorrida];
        return nuevas;
      });
      return { valido: true };
    }

    if (codigoBarras.length !== 6) {
      setValidacionesCorrida(prev => ({
        ...prev,
        [indexCorrida]: {
          estado: 'incompleto',
          mensaje: `Ingrese 6 dígitos (faltan ${6 - codigoBarras.length})`
        }
      }));
      return { valido: false, mensaje: 'El código debe tener 6 dígitos' };
    }

    // Validar duplicados dentro de la misma corrida
    const duplicadoEnCorrida = productosCorreida.find((producto, index) =>
      producto.codigo_barra === codigoBarras && index !== indexCorrida
    );

    if (duplicadoEnCorrida) {
      const mensaje = `Duplicado en la corrida (Talla: ${duplicadoEnCorrida.numero})`;
      setValidacionesCorrida(prev => ({
        ...prev,
        [indexCorrida]: {
          estado: 'duplicado',
          mensaje: mensaje
        }
      }));
      return { valido: false, mensaje: mensaje };
    }

    // Validar en la lista principal
    const duplicadoEnLista = productosAgregar.find(producto =>
      producto.codigo_barra === codigoBarras
    );

    if (duplicadoEnLista) {
      const mensaje = `Ya está en la lista principal: ${duplicadoEnLista.marca} ${duplicadoEnLista.modelo} - ${duplicadoEnLista.color} (Talla: ${duplicadoEnLista.numero})`;
      setValidacionesCorrida(prev => ({
        ...prev,
        [indexCorrida]: {
          estado: 'duplicado',
          mensaje: mensaje
        }
      }));
      return { valido: false, mensaje: mensaje };
    }

    // Validar en la base de datos
    setValidandosCorrida(prev => ({ ...prev, [indexCorrida]: true }));
    const resultadoBD = await verificarCodigoEnBD(codigoBarras);
    setValidandosCorrida(prev => {
      const nuevos = { ...prev };
      delete nuevos[indexCorrida];
      return nuevos;
    });

    if (resultadoBD.error) {
      setValidacionesCorrida(prev => ({
        ...prev,
        [indexCorrida]: {
          estado: 'valido',
          mensaje: 'Código disponible (error de conexión)'
        }
      }));
      return { valido: true };
    }

    if (resultadoBD.existe) {
      const producto = resultadoBD.producto;
      const mensaje = `Ya existe en inventario: ${producto.MARCA} ${producto.MODELO} - ${producto.COLOR} (Talla: ${producto.TALLA})`;

      setValidacionesCorrida(prev => ({
        ...prev,
        [indexCorrida]: {
          estado: 'duplicado',
          mensaje: mensaje
        }
      }));

      // Mostrar snackbar
      enqueueSnackbar(mensaje, { variant: 'error' });

      return { valido: false, mensaje: mensaje };
    }

    setValidacionesCorrida(prev => ({
      ...prev,
      [indexCorrida]: {
        estado: 'valido',
        mensaje: 'Código disponible'
      }
    }));
    return { valido: true };
  };

  // Función para generar números de la corrida
  const generarNumerosCorreida = (inicio, fin, incremento) => {
    const numeros = [];
    const inicioNum = parseFloat(inicio);
    const finNum = parseFloat(fin);
    const inc = parseFloat(incremento);

    for (let i = inicioNum; i <= finNum; i += inc) {
      numeros.push(i.toString());
    }

    return numeros;
  };

  // Manejar generación de corrida
  const handleGenerarCorreida = () => {
    if (!corridaData.marca || !corridaData.modelo || !corridaData.color || !corridaData.precio ||
      !corridaData.numeroInicio || !corridaData.numeroFin) {
      enqueueSnackbar('Por favor, complete todos los campos de la corrida.', { variant: 'warning' });
      return;
    }

    const inicio = parseFloat(corridaData.numeroInicio);
    const fin = parseFloat(corridaData.numeroFin);

    if (inicio >= fin) {
      enqueueSnackbar('El número de inicio debe ser menor que el número final.', { variant: 'warning' });
      return;
    }

    const numeros = generarNumerosCorreida(corridaData.numeroInicio, corridaData.numeroFin, corridaData.incremento);

    if (numeros.length > 10) {
      enqueueSnackbar('La corrida no puede tener más de 10 productos.', { variant: 'warning' });
      return;
    }

    const nuevosProductos = numeros.map(numero => ({
      marca: corridaData.marca,
      modelo: corridaData.modelo,
      color: corridaData.color,
      precio: corridaData.precio,
      numero: numero,
      codigo_barra: '' // Se llenará manualmente
    }));

    setProductosCorreida(nuevosProductos);
    // Limpiar validaciones previas
    setValidacionesCorrida({});
    setValidandosCorrida({});
    enqueueSnackbar(`Corrida generada: ${numeros.length} productos`, { variant: 'success' });
  };

  // MODIFICADO: Manejar cambio de código en corrida con validación
  const handleCodigoCorridaChange = async (index, codigo) => {
    const nuevosProductos = [...productosCorreida];
    nuevosProductos[index].codigo_barra = codigo;
    setProductosCorreida(nuevosProductos);

    // Validar el código después de un pequeño delay
    if (codigo.trim() === '') {
      setValidacionesCorrida(prev => {
        const nuevas = { ...prev };
        delete nuevas[index];
        return nuevas;
      });
      return;
    }

    // Delay para evitar demasiadas llamadas a la API
    setTimeout(() => {
      if (nuevosProductos[index].codigo_barra === codigo) {
        validarCodigoEnCorrida(codigo, index);
      }
    }, 500);
  };

  // Agregar corrida completa a la lista principal
  const handleAgregarCorreida = async () => {
    // Verificar que todos tengan código
    const sinCodigo = productosCorreida.filter(p => !p.codigo_barra || p.codigo_barra.trim().length !== 6);
    if (sinCodigo.length > 0) {
      enqueueSnackbar(`Faltan ${sinCodigo.length} códigos de barras por completar.`, { variant: 'warning' });
      return;
    }

    // Verificar que no haya códigos con errores
    const codigosConErrores = Object.values(validacionesCorrida).filter(v => v.estado === 'duplicado' || v.estado === 'incompleto');
    if (codigosConErrores.length > 0) {
      enqueueSnackbar('Hay códigos con errores. Por favor, corrija antes de continuar.', { variant: 'error' });
      return;
    }

    // Validar códigos duplicados dentro de la corrida
    const codigos = productosCorreida.map(p => p.codigo_barra);
    const duplicados = codigos.filter((codigo, index) => codigos.indexOf(codigo) !== index);
    if (duplicados.length > 0) {
      enqueueSnackbar('Hay códigos duplicados dentro de la corrida.', { variant: 'error' });
      return;
    }

    // Validar cada código contra BD y lista actual (validación final)
    for (let i = 0; i < productosCorreida.length; i++) {
      const producto = productosCorreida[i];
      const validacion = await validarCodigoBarras(producto.codigo_barra, null, false);

      if (!validacion.valido) {
        enqueueSnackbar(`Código ${producto.codigo_barra} (Talla ${producto.numero}): ${validacion.mensaje}`, { variant: 'error' });
        return;
      }
    }

    // Agregar todos los productos a la lista principal
    setProductosAgregar(prev => [...prev, ...productosCorreida]);
    enqueueSnackbar(`${productosCorreida.length} productos agregados a la lista.`, { variant: 'success' });

    // Limpiar y cerrar modal
    setProductosCorreida([]);
    setValidacionesCorrida({});
    setValidandosCorrida({});
    setCorridaData({
      marca: '',
      modelo: '',
      color: '',
      precio: '',
      numeroInicio: '',
      numeroFin: '',
      incremento: '1'
    });
    setMostrarCorridas(false);
  };

  // Funciones originales...
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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const codigo = formData.codigo_barra?.trim();
      if (codigo && codigo.length === 6) {
        validarCodigoBarras(codigo, editingIndex, false);
      } else if (codigo && codigo.length > 0 && codigo.length < 6) {
        setEstadoCodigo('incompleto');
        setMensajeValidacion(`Ingrese 6 dígitos (faltan ${6 - codigo.length})`);
      } else if (codigo.length === 0) {
        setEstadoCodigo(null);
        setMensajeValidacion('');
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.codigo_barra, productosAgregar, editingIndex]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    if (name === 'codigo_barra') {
      setEstadoCodigo(null);
      setMensajeValidacion('');
      setValidandoCodigo(false);
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

    if (formData.codigo_barra.trim().length !== 6) {
      enqueueSnackbar('El código de barras debe tener exactamente 6 dígitos.', { variant: 'warning' });
      return;
    }

    const validacion = await validarCodigoBarras(formData.codigo_barra.trim(), editingIndex, true);

    if (!validacion.valido) {
      return;
    }

    const nuevoProducto = {
      ...formData,
      numero: formData.numero.value,
      codigo_barra: formData.codigo_barra.trim()
    };

    if (editingIndex !== null) {
      const nuevosProductos = [...productosAgregar];
      nuevosProductos[editingIndex] = nuevoProducto;
      setProductosAgregar(nuevosProductos);
      setEditingIndex(null);
      enqueueSnackbar('Producto actualizado en la lista.', { variant: 'success' });
    } else {
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

    setEstadoCodigo(null);
    setMensajeValidacion('');
    setValidandoCodigo(false);
  };

  const handleEditar = (index) => {
    const productoAEditar = productosAgregar[index];
    setFormData({
      ...productoAEditar,
      numero: { value: productoAEditar.numero, label: productoAEditar.numero }
    });
    setEditingIndex(index);

    setEstadoCodigo(null);
    setMensajeValidacion('');
    setValidandoCodigo(false);
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
        setValidandoCodigo(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (productosAgregar.length === 0) {
      enqueueSnackbar('No hay productos para agregar al inventario.', { variant: 'warning' });
      return;
    }

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
        console.log('📤 Enviando productos al servidor...');
        for (const producto of productosAgregar) {
          const response = await api.post('/api/inventario', producto);
          console.log('✅ Producto agregado:', response.data);
        }
        enqueueSnackbar('Los productos han sido agregados al inventario.', { variant: 'success' });
        setProductosAgregar([]);
        onProductoAgregado();
      } catch (error) {
        console.error('💥 Error al agregar productos:', error);

        if (error.response?.status === 400 || error.response?.data?.message?.includes('duplicado')) {
          await mostrarError('Código Duplicado', 'Uno de los códigos ya existe en la base de datos. Por favor, verifique y corrija.');
        } else {
          await mostrarError('Error', 'Ha ocurrido un error al agregar los productos al inventario. Por favor, inténtelo de nuevo.');
        }
      }
    }
  };

  const duplicadosEnLista = verificarDuplicadosEnLista();
  const botonDeshabilitado = validandoCodigo ||
    estadoCodigo === 'duplicado' ||
    estadoCodigo === 'incompleto';

  return (
    <div className="agregar-inventario-container">
      {!mostrarCorridas ? (
        // FORMULARIO INDIVIDUAL
        <>
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
                  maxLength="6"
                  style={{
                    borderColor: estadoCodigo === 'valido' ? '#4caf50' :
                      estadoCodigo === 'duplicado' ? '#f44336' :
                        estadoCodigo === 'incompleto' ? '#ff9800' :
                          estadoCodigo === 'error' ? '#f44336' : '',
                    borderWidth: estadoCodigo ? '2px' : '1px'
                  }}
                />
                {validandoCodigo && (
                  <small style={{ color: '#666', fontSize: '12px' }}>
                    🔄 Verificando código en base de datos...
                  </small>
                )}
                {mensajeValidacion && !validandoCodigo && (
                  <small style={{
                    color: estadoCodigo === 'valido' ? '#4caf50' :
                      estadoCodigo === 'duplicado' ? '#f44336' :
                        estadoCodigo === 'incompleto' ? '#ff9800' :
                          estadoCodigo === 'error' ? '#f44336' : '#666',
                    fontSize: '12px',
                    display: 'block',
                    marginTop: '4px'
                  }}>
                    {estadoCodigo === 'valido' ? '✅' :
                      estadoCodigo === 'duplicado' ? '❌' :
                        estadoCodigo === 'incompleto' ? '⚠️' :
                          estadoCodigo === 'error' ? '💥' : ''} {mensajeValidacion}
                  </small>
                )}
              </div>
            </div>

            <div className="form-actions" style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '15px',
              marginTop: '20px'
            }}>

              <button
                type="button"
                className="btn-primary"
                onClick={() => setMostrarCorridas(true)}
              >
                📏 INTRODUCIR POR CORRIDAS
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleAgregarALista}
                disabled={botonDeshabilitado}
                style={{
                  opacity: botonDeshabilitado ? 0.6 : 1,
                  cursor: botonDeshabilitado ? 'not-allowed' : 'pointer'
                }}
              >
                <img src={iconAgregar} alt="Agregar a la lista" />
                {editingIndex !== null ? 'ACTUALIZAR EN LA LISTA' : 'AGREGAR A LA LISTA'}
                {validandoCodigo && ' (Verificando...)'}
                {estadoCodigo === 'duplicado' && ' (Código duplicado)'}
                {estadoCodigo === 'incompleto' && ' (Código incompleto)'}
              </button>
            </div>
          </form>
        </>
      ) : (
        // FORMULARIO DE CORRIDAS
        <div className="corridas-container">
          <div style={{
            backgroundColor: '#f5f5f5',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>
              📏 Introducir Corrida de Medias
            </h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
              Complete los datos generales y seleccione el rango de tallas. Después agregue el código de barras para cada producto.
            </p>

            <div className="form-row">
              <div className="form-group">
                <label>Marca:</label>
                <input
                  type="text"
                  value={corridaData.marca}
                  onChange={(e) => setCorridaData({ ...corridaData, marca: e.target.value })}
                  placeholder="Ingrese la marca"
                  required
                />
              </div>
              <div className="form-group">
                <label>Modelo:</label>
                <input
                  type="text"
                  value={corridaData.modelo}
                  onChange={(e) => setCorridaData({ ...corridaData, modelo: e.target.value })}
                  placeholder="Ingrese el modelo"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Color:</label>
                <input
                  type="text"
                  value={corridaData.color}
                  onChange={(e) => setCorridaData({ ...corridaData, color: e.target.value })}
                  placeholder="Ingrese el color"
                  required
                />
              </div>
              <div className="form-group">
                <label>Precio:</label>
                <input
                  type="text"
                  value={corridaData.precio}
                  onChange={(e) => setCorridaData({ ...corridaData, precio: e.target.value })}
                  placeholder="Precio para todos"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de numeración:</label>
                <Select
                  value={incrementoOptions.find(opt => opt.value === corridaData.incremento)}
                  onChange={(selectedOption) => setCorridaData({ ...corridaData, incremento: selectedOption.value })}
                  options={incrementoOptions}
                  styles={customSelectStyles}
                  placeholder="Selecciona el tipo"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Número inicial:</label>
                <input
                  type="number"
                  step={corridaData.incremento}
                  value={corridaData.numeroInicio}
                  onChange={(e) => setCorridaData({ ...corridaData, numeroInicio: e.target.value })}
                  placeholder="Ej: 22"
                  required
                />
              </div>
              <div className="form-group">
                <label>Número final:</label>
                <input
                  type="number"
                  step={corridaData.incremento}
                  value={corridaData.numeroFin}
                  onChange={(e) => setCorridaData({ ...corridaData, numeroFin: e.target.value })}
                  placeholder="Ej: 27"
                  required
                />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleGenerarCorreida}
                style={{ marginRight: '10px' }}
              >
                ⚡ GENERAR CORRIDA
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setMostrarCorridas(false);
                  setProductosCorreida([]);
                  setValidacionesCorrida({});
                  setValidandosCorrida({});
                  setCorridaData({
                    marca: '',
                    modelo: '',
                    color: '',
                    precio: '',
                    numeroInicio: '',
                    numeroFin: '',
                    incremento: '1'
                  });
                }}
                style={{
                  backgroundColor: '#666',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ← VOLVER AL FORMULARIO INDIVIDUAL
              </button>
            </div>
          </div>

          {/* TABLA DE PRODUCTOS GENERADOS */}
          {productosCorreida.length > 0 && (
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}>
              <h4 style={{ marginTop: 0, color: '#333' }}>
                🎯 Productos Generados ({productosCorreida.length})
              </h4>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>
                Agregue el código de barras para cada producto:
              </p>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Marca</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Modelo</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Color</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Talla</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Precio</th>
                    <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Código de Barras</th>
                  </tr>
                </thead>
                <tbody>
                  {productosCorreida.map((producto, index) => {
                    const validacion = validacionesCorrida[index];
                    const estaValidando = validandosCorrida[index];
                    
                    return (
                      <tr key={index}>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{producto.marca}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{producto.modelo}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>{producto.color}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold' }}>{producto.numero}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>${producto.precio}</td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          <div>
                            <input
                              type="text"
                              value={producto.codigo_barra}
                              onChange={(e) => handleCodigoCorridaChange(index, e.target.value)}
                              placeholder="6 dígitos"
                              maxLength="6"
                              disabled={estaValidando}
                              style={{
                                width: '100%',
                                padding: '5px',
                                border: '1px solid #ccc',
                                borderRadius: '3px',
                                fontSize: '12px',
                                borderColor: validacion?.estado === 'valido' ? '#4caf50' :
                                  validacion?.estado === 'duplicado' ? '#f44336' :
                                    validacion?.estado === 'incompleto' ? '#ff9800' :
                                      producto.codigo_barra?.length === 6 ? '#4caf50' : '#ccc',
                                borderWidth: validacion?.estado ? '2px' : 
                                  (producto.codigo_barra?.length === 6 ? '2px' : '1px')
                              }}
                            />
                            {estaValidando && (
                              <small style={{ 
                                color: '#666', 
                                fontSize: '10px',
                                display: 'block',
                                marginTop: '2px'
                              }}>
                                🔄 Verificando...
                              </small>
                            )}
                            {validacion && !estaValidando && (
                              <small style={{
                                color: validacion.estado === 'valido' ? '#4caf50' :
                                  validacion.estado === 'duplicado' ? '#f44336' :
                                    validacion.estado === 'incompleto' ? '#ff9800' : '#666',
                                fontSize: '10px',
                                display: 'block',
                                marginTop: '2px'
                              }}>
                                {validacion.estado === 'valido' ? '✅' :
                                  validacion.estado === 'duplicado' ? '❌' :
                                    validacion.estado === 'incompleto' ? '⚠️' : ''} {validacion.mensaje}
                              </small>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleAgregarCorreida}
                  disabled={
                    productosCorreida.some(p => !p.codigo_barra || p.codigo_barra.length !== 6) ||
                    Object.values(validacionesCorrida).some(v => v.estado === 'duplicado' || v.estado === 'incompleto') ||
                    Object.keys(validandosCorrida).length > 0
                  }
                  style={{
                    opacity: (
                      productosCorreida.some(p => !p.codigo_barra || p.codigo_barra.length !== 6) ||
                      Object.values(validacionesCorrida).some(v => v.estado === 'duplicado' || v.estado === 'incompleto') ||
                      Object.keys(validandosCorrida).length > 0
                    ) ? 0.6 : 1,
                    cursor: (
                      productosCorreida.some(p => !p.codigo_barra || p.codigo_barra.length !== 6) ||
                      Object.values(validacionesCorrida).some(v => v.estado === 'duplicado' || v.estado === 'incompleto') ||
                      Object.keys(validandosCorrida).length > 0
                    ) ? 'not-allowed' : 'pointer'
                  }}
                >
                  <img src={iconAgregar} alt="Agregar corrida" />
                  AGREGAR CORRIDA A LA LISTA ({productosCorreida.filter(p => p.codigo_barra?.length === 6).length}/{productosCorreida.length})
                  {Object.values(validacionesCorrida).some(v => v.estado === 'duplicado') && ' (Hay duplicados)'}
                  {Object.keys(validandosCorrida).length > 0 && ' (Verificando...)'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* LISTA DE PRODUCTOS AGREGADOS */}
      {productosAgregar.length > 0 && (
        <div className="productos-agregados" style={{ marginTop: '30px' }}>
          <h3 style={{ color: '#333' }}>
            📦 Productos en Lista ({productosAgregar.length})
          </h3>
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
                  <td style={{ fontWeight: 'bold' }}>{producto.numero}</td>
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
            style={{ marginTop: '15px' }}
          >
            <img src={iconAgregar} alt="Agregar al inventario" />
            AGREGAR AL INVENTARIO ({productosAgregar.length} productos)
            {Object.keys(duplicadosEnLista).length > 0 && ' (Hay duplicados)'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AgregarInventario;