import { useState, useEffect, useRef } from 'react'; 
import axios from 'axios';
import { useSnackbar } from 'notistack';
import Select from 'react-select';
import { customSelectStyles } from '../../styles/estilosGenerales';
import './Devoluciones.css';
import RegistrarVenta from '../Ventas/RegistrarVenta';
import { format, parseISO } from 'date-fns';
import es from 'date-fns/locale/es';
import  './Devoluciones.css';
import iconCancelar from '../../assets/images/svg/cancelar.svg';
import iconAceptar from '../../assets/images/svg/aceptar.svg';

const RegistrarDevolucion = ({ onDevolucionRegistrada }) => {
  const { enqueueSnackbar } = useSnackbar();
  const ventaDevolucionRef = useRef(null);
  const [paso, setPaso] = useState(1); // 1: Buscar, 2: Procesar devolución, 3: Cambio, 4: Saldo
  const [vendedorOptions, setVendedorOptions] = useState([]);
  const [consultaSaldo, setConsultaSaldo] = useState({ codigo: '', resultado: null });
  const formatearFechaCompleta = (fechaString) => {
    if (!fechaString) return 'Fecha no disponible';
    try {
      const fecha = parseISO(fechaString);
      return format(fecha, 'PPP', { locale: es });
    } catch (error) {
      console.error('Error al formatear fecha completa:', error);
      return 'Fecha inválida';
    }
  };
  
  const [formData, setFormData] = useState({
    codigoBarras: '',
    productoVendido: null,
    vendedor: null,
    motivoDevolucion: null,
    descripcionMotivo: '',
    requiereCambio: false,
    observaciones: '',
    ticketOriginal: null,
    devolucionActual: null  // Agregamos esta línea
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
        const response = await axios.get('/api/usuarios');
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
        const response = await axios.get(`/api/inventario/vendido/${codigoBarras}`);
        if (response.data) {
          console.log('=== ANÁLISIS DETALLADO DE LA VENTA ===');
          console.log('VENTA completa:', response.data.VENTA);
          console.log('VENTA[0]:', response.data.VENTA[0]);
          console.log('Estructura de VENTA:', {
            tieneVenta: !!response.data.VENTA,
            tipoDeVenta: typeof response.data.VENTA,
            vendedor: response.data.VENTA?.[0]?.VENDEDOR,
            metodoPago: response.data.VENTA?.[0]?.METODO_PAGO,
            fechaVenta: response.data.VENTA?.[0]?.FECHA_VENTA
          });
          
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

          console.log('=== FORM DATA ACTUALIZADO ===');
          console.log('Producto en formData:', response.data);
          console.log('Ticket original:', response.data.VentasInfos);
          console.log('============================');
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
      const response = await axios.get(`/api/inventario/vendido/${formData.codigoBarras}`);
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

    // Validar que existe información de la venta
    if (!formData.productoVendido?.VENTA?.[0]?.PK_VENTA) {
      enqueueSnackbar('No se encontró la información de la venta original', { variant: 'error' });
      return;
    }

    try {
      // 1. Actualizar estado del producto
      const nuevoEstado = formData.motivoDevolucion.value === 'defecto_fabrica' ? 0 : 1;
      await axios.put(`/api/inventario/${formData.productoVendido.PK_PRODUCTO}`, {
        FK_ESTATUS_PRODUCTO: nuevoEstado
      });

      await axios.put(`/api/ventas/${formData.productoVendido.VENTA[0].PK_VENTA}`,{
        FK_ESTATUS_VENTA: 2// 2 = Devolución
      });

      // 2. Registrar la devolución
      const devolucionData = {
        FK_PRODUCTO: formData.productoVendido.PK_PRODUCTO,
        FK_VENTA: formData.productoVendido.VENTA[0].PK_VENTA, // Cambiado aquí
        FK_VENDEDOR: formData.vendedor.value,
        MOTIVO: formData.motivoDevolucion.value,
        DESCRIPCION_MOTIVO: formData.descripcionMotivo || '',
        ESTADO_FINAL: nuevoEstado,
        OBSERVACIONES: formData.observaciones || '',
        TIPO_DEVOLUCION: formData.requiereCambio ? 'cambio' : 'saldo_favor'
      };

      const responseDevolucion = await axios.post('/api/devoluciones', devolucionData);
      console.log('Devolución registrada:', responseDevolucion.data);

      // Actualizar el formData con el PK_DEVOLUCION
      setFormData(prev => ({
        ...prev,
        devolucionActual: responseDevolucion.data
      }));

      if (formData.requiereCambio) {
        setTimeout(() => {
          ventaDevolucionRef.current?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
        setPaso(3);
      } else {
        // Generar saldo a favor
        const saldoData = {
          FK_DEVOLUCION: responseDevolucion.data.PK_DEVOLUCION,
          CODIGO_UNICO: generarCodigoUnico(),
          MONTO: formData.productoVendido.PRECIO
        };

        const responseSaldo = await axios.post('/api/saldos', saldoData);
        setConsultaSaldo({ codigo: responseSaldo.data.CODIGO_UNICO, resultado: responseSaldo.data });
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
      console.log('Detalles del error:', error.message);
      
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
        console.log('Datos recibidos de la nueva venta:', datosNuevaVenta);
        
        // Usar el PK_DEVOLUCION guardado
        if (!formData.devolucionActual?.PK_DEVOLUCION) {
          throw new Error('No se encontró la información de la devolución');
        }

        const updateData = {
          FK_VENTA_NUEVA: datosNuevaVenta.PK_VENTA,
          DIFERENCIA_PRECIO: datosNuevaVenta.diferencia
        };

        console.log('Actualizando devolución:', {
          id: formData.devolucionActual.PK_DEVOLUCION,
          datos: updateData
        });

        await axios.put(
        `/api/devoluciones/${formData.devolucionActual.PK_DEVOLUCION}`, 
        updateData
        );

        // Si hay diferencia a favor del cliente, generar saldo
        if (datosNuevaVenta.diferencia < 0) {
          console.log('Generando saldo a favor por:', Math.abs(datosNuevaVenta.diferencia));
          const saldoData = {
              FK_DEVOLUCION: formData.devolucionActual.PK_DEVOLUCION,
              CODIGO_UNICO: generarCodigoUnico(),
              MONTO: Math.abs(datosNuevaVenta.diferencia)
          };
      
          const responseSaldo = await axios.post('/api/saldos', saldoData);
          setConsultaSaldo({ codigo: responseSaldo.data.CODIGO_UNICO, resultado: responseSaldo.data });
          console.log('Saldo generado:', responseSaldo.data);
          setPaso(4);
        } else if (datosNuevaVenta.diferencia > 0) {
            enqueueSnackbar(`El cliente debe pagar una diferencia de $${datosNuevaVenta.diferencia.toFixed(2)}`, {
                variant: 'info'
            });
            resetForm();
        } else {
            enqueueSnackbar('Cambio realizado sin diferencia de precio', {
                variant: 'success'
            });
            resetForm();
        }

        onDevolucionRegistrada();
        enqueueSnackbar('Proceso de cambio completado correctamente', { variant: 'success' });

    } catch (error) {
        console.error('Error al finalizar el cambio:', error);
        console.log('Detalles del error:', error.response?.data || error.message);
        enqueueSnackbar(
            error.response?.data?.message || 'Error al procesar el cambio',
            { variant: 'error' }
        );
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
        ticketOriginal: null,
        devolucionActual: null
    });
    setConsultaSaldo({ codigo: '', resultado: null }); 
    setPaso(1);
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
              maxLength={6}
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
          <div className="venta-info-container">
            <h3>Detalles de la Devolución</h3>
            
            {/* Información de la venta original */}
            <div className="seccion-info">
              <h4>Venta Original</h4>
              <div className="ticket-original">
                <table>
                  <tbody>
                    <tr>
                      <td>Fecha</td>
                      <td>
                        {formData.productoVendido?.VENTA?.[0]?.FECHA_VENTA ? 
                          formatearFechaCompleta(formData.productoVendido.VENTA[0].FECHA_VENTA) : 
                          'Fecha no disponible'}
                      </td>
                    </tr>
                    <tr>
                      <td>Vendedor</td>
                      <td>
                        {formData.productoVendido?.VENTA?.[0]?.Vendedor?.NOMBRE_USUARIO || 'No disponible'}
                      </td>
                    </tr>
                    <tr>
                      <td>Método de Pago</td>
                      <td>
                        {formData.productoVendido?.VENTA?.[0]?.MetodoPago?.DESCRIPCION_METODO || 'No disponible'}
                      </td>
                    </tr>
                    {formData.productoVendido?.VENTA?.[0]?.OBSERVACIONES && (
                      <tr>
                        <td>Observaciones</td>
                        <td>
                          {formData.productoVendido.VENTA[0].OBSERVACIONES}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Información del producto */}
            <div className="seccion-info">
              <h4>Producto a Devolver</h4>
              <table className="producto-info-table">
                <thead>
                  <tr>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Color</th>
                    <th>Talla</th>
                    <th>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{formData.productoVendido.MARCA}</td>
                    <td>{formData.productoVendido.MODELO}</td>
                    <td>{formData.productoVendido.COLOR}</td>
                    <td>{formData.productoVendido.TALLA}</td>
                    <td>${parseFloat(formData.productoVendido.PRECIO).toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Formulario de devolución */}
          <div className="devolucion-form">
            <h4>Proceso de Devolución</h4>
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
              <div className="checkbox-container">
                <label htmlFor="requiereCambio">El cliente requiere cambio de producto</label>
                <input
                  type="checkbox"
                  id="requiereCambio"
                  checked={formData.requiereCambio}
                  onChange={(e) => setFormData(prev => ({ ...prev, requiereCambio: e.target.checked }))}
                />
              </div>
            </div>

            <div className="buttons-container">
              <button className="btn-primary btn-success" onClick={handleProcesarDevolucion}>
                <img src={iconAceptar} alt="Finalizar venta" />
                Procesar Devolución
              </button>
              <button className="btn-primary btn-danger" onClick={resetForm}>
                <img src={iconCancelar} alt="Cancelar venta" />
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paso 3: Proceso de cambio */}
      {paso === 3 && (
        <div className="paso-cambio">
          <h3 class="ventaXDevolucion" ref={ventaDevolucionRef}>Venta por Devolución</h3>
          <RegistrarVenta 
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
              // Caso cuando hubo cambio de producto
              consultaSaldo.resultado && (
                <>
                  <p>Se ha generado un saldo a favor por la diferencia:</p>
                  <p className="codigo-saldo">Código: <strong>{consultaSaldo.resultado.CODIGO_UNICO}</strong></p>
                  <p className="monto-saldo">Monto: <strong>${parseFloat(consultaSaldo.resultado.MONTO).toFixed(2)}</strong></p>
                </>
              )
            ) : (
              // Caso cuando NO hubo cambio de producto (devolución completa)
              <>
                <p>Se ha generado un saldo a favor para el cliente:</p>
                <p className="codigo-saldo">Código: <strong>{consultaSaldo.resultado.CODIGO_UNICO}</strong></p>
                <p className="monto-saldo">Monto: <strong>${parseFloat(consultaSaldo.resultado.MONTO).toFixed(2)}</strong></p>
              </>
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