import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import Select from 'react-select';
import { customSelectStyles } from '../../styles/estilosGenerales';
import './Devoluciones.css';

// Importación de componentes y contextos necesarios
import Ventas from '../Ventas/Ventas';

const Devoluciones = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [paso, setPaso] = useState(1); // 1: Buscar, 2: Procesar devolución, 3: Cambio
  const [vendedorOptions, setVendedorOptions] = useState([]);

  const [formData, setFormData] = useState({
    codigoBarras: '',
    productoVendido: null,
    vendedor: null,
    motivoDevolucion: null,
    descripcionMotivo: '',
    requiereCambio: false,
    observaciones: ''
  });

  const opcionesMotivo = [
    { value: 'buen_estado', label: 'Producto en buen estado - Retornar a inventario' },
    { value: 'defectuoso', label: 'Producto defectuoso - Dar de baja' }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const fetchVendedores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/usuarios');
        const vendedores = response.data.map(vendedor => ({
          value: vendedor.ID_USUARIO,
          label: `${vendedor.NOMBRE_USUARIO}`
        }));
        setVendedorOptions(vendedores);
      } catch (error) {
        console.error('Error al obtener vendedores:', error);
        enqueueSnackbar('Error al cargar la lista de vendedores', { variant: 'error' });
      }
    };

    fetchVendedores();
  }, []);

  // Manejadores de eventos
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
          setPaso(2);
          enqueueSnackbar('Producto vendido encontrado', { variant: 'success' });
        }
      } catch (error) {
        console.error('Error al buscar el producto vendido:', error);
        enqueueSnackbar('No se encontró el producto vendido', { variant: 'warning' });
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
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
        setPaso(2);
        enqueueSnackbar('Producto vendido encontrado', { variant: 'success' });
      }
    } catch (error) {
      console.error('Error al buscar el producto vendido:', error);
      enqueueSnackbar('No se encontró el producto o ocurrió un error', { variant: 'error' });
    }
  };

  const handleMotivoChange = (selectedOption) => {
    setFormData(prev => ({
      ...prev,
      motivoDevolucion: selectedOption
    }));
  };

  const handleProcesarDevolucion = async () => {
    if (!formData.motivoDevolucion || !formData.vendedor) {
      enqueueSnackbar('Por favor complete todos los campos requeridos', { variant: 'warning' });
      return;
    }

    try {
      // 1. Actualizar estado del producto
      const nuevoEstado = formData.motivoDevolucion.value === 'buen_estado' ? 1 : 0;
      await axios.put(`http://localhost:5000/api/inventario/${formData.productoVendido.PK_PRODUCTO}`, {
        FK_ESTATUS_PRODUCTO: nuevoEstado
      });

      // 2. Registrar la devolución
      const devolucionData = {
        FK_PRODUCTO: formData.productoVendido.PK_PRODUCTO,
        FK_VENTA: formData.productoVendido.VentasInfos.PK_VENTA,
        FK_VENDEDOR: formData.vendedor.value,
        MOTIVO: formData.motivoDevolucion.value,
        DESCRIPCION_MOTIVO: formData.descripcionMotivo,
        ESTADO_FINAL: nuevoEstado,
        OBSERVACIONES: formData.observaciones
      };

      await axios.post('http://localhost:5000/api/devoluciones', devolucionData);

      if (formData.requiereCambio) {
        setPaso(3);
      } else {
        // Reiniciar formulario
        setFormData({
          codigoBarras: '',
          productoVendido: null,
          vendedor: null,
          motivoDevolucion: null,
          descripcionMotivo: '',
          requiereCambio: false,
          observaciones: ''
        });
        setPaso(1);
      }

      enqueueSnackbar('Devolución procesada correctamente', { variant: 'success' });
    } catch (error) {
      console.error('Error al procesar la devolución:', error);
      enqueueSnackbar('Error al procesar la devolución', { variant: 'error' });
    }
  };

  const handleCambioCompleto = async (datosNuevaVenta) => {
    try {
      // Actualizar la devolución con los datos de la nueva venta
      await axios.put(`http://localhost:5000/api/devoluciones/${formData.productoVendido.PK_PRODUCTO}`, {
        FK_VENTA_NUEVA: datosNuevaVenta.PK_VENTA,
        DIFERENCIA_PRECIO: datosNuevaVenta.diferencia
      });

      // Reiniciar formulario
      setFormData({
        codigoBarras: '',
        productoVendido: null,
        vendedor: null,
        motivoDevolucion: null,
        descripcionMotivo: '',
        requiereCambio: false,
        observaciones: ''
      });
      setPaso(1);

      enqueueSnackbar('Proceso de cambio completado correctamente', { variant: 'success' });
    } catch (error) {
      console.error('Error al finalizar el cambio:', error);
      enqueueSnackbar('Error al procesar el cambio', { variant: 'error' });
    }
  };

  return (
    <div className="page-container">
      <div className="headerTitle">
        <h2>DEVOLUCIONES</h2>
      </div>

      {/* Paso 1: Búsqueda del producto */}
      {paso === 1 && (
        <div className="paso-busqueda">
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
            <button onClick={buscarProductoVendido} className="btn-primary">
              Buscar
            </button>
          </div>
        </div>
      )}

      {/* Paso 2: Información del producto y proceso de devolución */}
      {paso === 2 && formData.productoVendido && (
        <div className="paso-devolucion">
          <h3>Información del Producto Vendido</h3>
          <table className="producto-info-table">
            <thead>
              <tr>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Color</th>
                <th>Talla</th>
                <th>Precio</th>
                <th>Fecha de Venta</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{formData.productoVendido.MARCA}</td>
                <td>{formData.productoVendido.MODELO}</td>
                <td>{formData.productoVendido.COLOR}</td>
                <td>{formData.productoVendido.TALLA}</td>
                <td>${parseFloat(formData.productoVendido.PRECIO).toFixed(2)}</td>
                <td>{new Date(formData.productoVendido.VentasInfos?.FECHA_VENTA).toLocaleDateString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="devolucion-form">
            <div className="form-row">
              <div className="form-group">
                <label>Vendedor que procesa:</label>
                <Select
                  value={formData.vendedor}
                  onChange={(selected) => setFormData(prev => ({ ...prev, vendedor: selected }))}
                  options={vendedorOptions}
                  placeholder="Seleccione vendedor..."
                  styles={customSelectStyles}
                />
              </div>

              <div className="form-group">
                <label>Motivo de la devolución:</label>
                <Select
                  value={formData.motivoDevolucion}
                  onChange={handleMotivoChange}
                  options={opcionesMotivo}
                  placeholder="Seleccione motivo..."
                  styles={customSelectStyles}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Descripción del motivo:</label>
                <textarea
                  value={formData.descripcionMotivo}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcionMotivo: e.target.value }))}
                  placeholder="Describa el motivo de la devolución"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Observaciones:</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Observaciones adicionales"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.requiereCambio}
                    onChange={(e) => setFormData(prev => ({ ...prev, requiereCambio: e.target.checked }))}
                  />
                  El cliente requiere cambio de producto
                </label>
              </div>
            </div>

            <button 
              className="btn-primary"
              onClick={handleProcesarDevolucion}
            >
              Procesar Devolución
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Proceso de cambio */}
      {paso === 3 && (
        <div className="paso-cambio">
          <h3>Selección de Nuevo Producto</h3>
          <Ventas 
            modo="cambio"
            productoDevuelto={formData.productoVendido}
            onCambioCompleto={handleCambioCompleto}
          />
        </div>
      )}
    </div>
  );
};

export default Devoluciones;
