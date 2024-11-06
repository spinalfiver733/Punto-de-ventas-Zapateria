import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import Select from 'react-select';
import { customSelectStyles } from '../../styles/estilosGenerales';
import './Devoluciones.css';
import Ventas from '../Ventas/Ventas';
import { format } from 'date-fns';
import es from 'date-fns/locale/es';

const RegistrarDevolucion = ({ onDevolucionRegistrada }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [paso, setPaso] = useState(1); // 1: Buscar, 2: Procesar devolución, 3: Cambio, 4: Saldo
  const [vendedorOptions, setVendedorOptions] = useState([]);
  const [formData, setFormData] = useState({
    codigoBarras: '',
    productoVendido: null,
    vendedor: null,
    motivoDevolucion: null,
    descripcionMotivo: '',
    requiereCambio: false,
    observaciones: '',
    ticketOriginal: null
  });

  const opcionesMotivo = [
    { value: 'no_talla', label: 'No es la talla correcta' },
    { value: 'no_gusto', label: 'No le gustó al cliente' },
    { value: 'defecto_fabrica', label: 'Defecto de fábrica' },
    { value: 'otro', label: 'Otro motivo' }
  ];

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
  }, [enqueueSnackbar]);

  const handleCodigoBarrasChange = async (e) => {
    const codigoBarras = e.target.value;
    setFormData(prev => ({ ...prev, codigoBarras }));
  
    if (codigoBarras.length >= 6) {
      try {
        const response = await axios.get(`http://localhost:5000/api/inventario/vendido/${codigoBarras}`);
        if (response.data) {
          if (response.data.FK_ESTATUS_PRODUCTO !== 2) {
            enqueueSnackbar('Este producto no está registrado como vendido', { variant: 'warning' });
            return;
          }
  
          setFormData(prev => ({
            ...prev,
            productoVendido: response.data,
            ticketOriginal: response.data.VentasInfos
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
        if (response.data.FK_ESTATUS_PRODUCTO !== 2) {
          enqueueSnackbar('Este producto no está registrado como vendido', { variant: 'warning' });
          return;
        }

        setFormData(prev => ({
          ...prev,
          productoVendido: response.data,
          ticketOriginal: response.data.VentasInfos
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

  const generarCodigoUnico = () => {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 8; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  };

  const handleProcesarDevolucion = async () => {
    // Validación inicial de campos requeridos
    if (!formData.motivoDevolucion || !formData.vendedor) {
      enqueueSnackbar('Por favor complete todos los campos requeridos', { variant: 'warning' });
      return;
    }

    try {
      // Obtener información actual
      const nuevoEstado = formData.motivoDevolucion.value === 'defecto_fabrica' ? 0 : 1;
      
      // Log de datos que se van a procesar
      console.log('==========================================');
      console.log('DATOS DE LA DEVOLUCIÓN A REGISTRAR:');
      console.log('==========================================');
      const datosDevolucion = {
        producto: {
          id: formData.productoVendido.PK_PRODUCTO,
          marca: formData.productoVendido.MARCA,
          modelo: formData.productoVendido.MODELO,
          color: formData.productoVendido.COLOR,
          talla: formData.productoVendido.TALLA,
          precio: formData.productoVendido.PRECIO
        },
        ventaOriginal: {
          id: formData.productoVendido.VentasInfos?.PK_VENTA,
          fecha: format(new Date(formData.productoVendido.VentasInfos?.FECHA_VENTA), 'dd/MM/yyyy'),
          vendedor: formData.productoVendido.VentasInfos?.VENDEDOR
        },
        devolucion: {
          vendedor: {
            id: formData.vendedor.value,
            nombre: formData.vendedor.label
          },
          motivo: {
            id: formData.motivoDevolucion.value,
            descripcion: formData.motivoDevolucion.label
          },
          descripcionMotivo: formData.descripcionMotivo,
          observaciones: formData.observaciones,
          tipo: formData.requiereCambio ? 'Cambio de Producto' : 'Saldo a Favor',
          estadoFinal: nuevoEstado === 0 ? 'Dado de Baja' : 'Retornado a Inventario'
        }
      };
      console.log(JSON.stringify(datosDevolucion, null, 2));

      // Validar que tengamos la información de la venta
      if (!formData.productoVendido.VentasInfos?.PK_VENTA) {
        throw new Error('No se encontró la información de la venta original');
      }

      // 1. Actualizar estado del producto
      console.log('1. Actualizando estado del producto...');
      await axios.put(`http://localhost:5000/api/inventario/${formData.productoVendido.PK_PRODUCTO}`, {
        FK_ESTATUS_PRODUCTO: nuevoEstado
      });
      console.log('Estado del producto actualizado a:', nuevoEstado);

      // 2. Registrar la devolución
      console.log('2. Registrando devolución...');
      const devolucionData = {
        FK_PRODUCTO: formData.productoVendido.PK_PRODUCTO,
        FK_VENTA: formData.productoVendido.VentasInfos.PK_VENTA,
        FK_VENDEDOR: formData.vendedor.value,
        MOTIVO: formData.motivoDevolucion.value,
        DESCRIPCION_MOTIVO: formData.descripcionMotivo || '',
        ESTADO_FINAL: nuevoEstado,
        OBSERVACIONES: formData.observaciones || '',
        TIPO_DEVOLUCION: formData.requiereCambio ? 'cambio' : 'saldo_favor'
      };

      console.log('Datos de devolución a enviar:', devolucionData);
      const responseDevolucion = await axios.post('http://localhost:5000/api/devoluciones', devolucionData);
      console.log('Devolución registrada:', responseDevolucion.data);

      // 3. Procesar según tipo de devolución
      if (formData.requiereCambio) {
        console.log('3. Iniciando proceso de cambio...');
        setPaso(3);
      } else {
        console.log('3. Generando saldo a favor...');
        const saldoData = {
          FK_DEVOLUCION: responseDevolucion.data.PK_DEVOLUCION,
          CODIGO_UNICO: generarCodigoUnico(),
          MONTO: formData.productoVendido.PRECIO
        };
        console.log('Datos de saldo a favor:', saldoData);

        const responseSaldo = await axios.post('http://localhost:5000/api/saldos', saldoData);
        console.log('Saldo generado:', responseSaldo.data);
        setPaso(4);
      }

      // 4. Notificar éxito
      onDevolucionRegistrada();
      enqueueSnackbar('Devolución procesada correctamente', { variant: 'success' });
      
      console.log('==========================================');
      console.log('DEVOLUCIÓN COMPLETADA EXITOSAMENTE');
      console.log('==========================================');

    } catch (error) {
      console.error('Error al procesar la devolución:', error);
      console.log('Detalles del error:', error.response?.data || error.message);
      
      // Mensaje de error más específico para el usuario
      let mensajeError = 'Error al procesar la devolución';
      if (error.message === 'No se encontró la información de la venta original') {
        mensajeError = 'No se encontró la información de la venta original';
      } else if (error.response?.data?.error) {
        mensajeError = error.response.data.error;
      }
      
      enqueueSnackbar(mensajeError, { variant: 'error' });
    }
};

  const handleCambioCompleto = async (datosNuevaVenta) => {
    try {
      // Actualizar la devolución con los datos de la nueva venta
      await axios.put(`http://localhost:5000/api/devoluciones/${formData.productoVendido.PK_PRODUCTO}`, {
        FK_VENTA_NUEVA: datosNuevaVenta.PK_VENTA,
        DIFERENCIA_PRECIO: datosNuevaVenta.diferencia
      });

      // Si hay diferencia a favor del cliente, generar saldo
      if (datosNuevaVenta.diferencia < 0) {
        const saldoData = {
          FK_DEVOLUCION: datosNuevaVenta.PK_DEVOLUCION,
          CODIGO_UNICO: generarCodigoUnico(),
          MONTO: Math.abs(datosNuevaVenta.diferencia)
        };

        await axios.post('http://localhost:5000/api/saldos', saldoData);
        setPaso(4);
      } else {
        resetForm();
      }

      onDevolucionRegistrada(); // Notificar al componente padre
      enqueueSnackbar('Proceso de cambio completado correctamente', { variant: 'success' });
    } catch (error) {
      console.error('Error al finalizar el cambio:', error);
      enqueueSnackbar('Error al procesar el cambio', { variant: 'error' });
    }
  };

  const resetForm = () => {
    setFormData({
      codigoBarras: '',
      productoVendido: null,
      vendedor: null,
      motivoDevolucion: null,
      descripcionMotivo: '',
      requiereCambio: false,
      observaciones: '',
      ticketOriginal: null
    });
    setPaso(1);
  };

  const renderTicketOriginal = () => {
    if (!formData.ticketOriginal) return null;

    return (
      <div className="ticket-original">
        <h4>Detalles de la Venta Original</h4>
        <div className="ticket-info">
          <p><strong>Fecha:</strong> {format(new Date(formData.ticketOriginal.FECHA_VENTA), 'PPP', { locale: es })}</p>
          <p><strong>Vendedor:</strong> {formData.ticketOriginal.VENDEDOR}</p>
          <p><strong>Método de Pago:</strong> {formData.ticketOriginal.METODO_PAGO}</p>
          {formData.ticketOriginal.OBSERVACIONES && (
            <p><strong>Observaciones:</strong> {formData.ticketOriginal.OBSERVACIONES}</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="registrar-devolucion-container">
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
              autoFocus
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
          {renderTicketOriginal()}
          
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
                <td>{format(new Date(formData.productoVendido.VentasInfos?.FECHA_VENTA), 'dd/MM/yyyy')}</td>
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
              <div className="textarea-group">
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
              <div className="textarea-group">
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

            <div className="form-actions">
              <button 
                className="btn-secondary"
                onClick={resetForm}
              >
                Cancelar
              </button>
              <button 
                className="btn-primary"
                onClick={handleProcesarDevolucion}
              >
                Procesar Devolución
                </button>
            </div>
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
            onCancelVenta={() => {}} // Agregamos esta prop
          />
        </div>
      )}

      {/* Paso 4: Mostrar información de finalización */}
      {paso === 4 && (
        <div className="paso-finalizado">
          <div className="finalizado-content">
            <h3>Devolución Completada</h3>
            <p>La devolución se ha procesado correctamente.</p>
            {formData.requiereCambio ? (
              <p>El cambio de producto ha sido registrado.</p>
            ) : (
              <p>Se ha generado un saldo a favor para el cliente.</p>
            )}
            <button 
              className="btn-primary"
              onClick={resetForm}
            >
              Nueva Devolución
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarDevolucion;