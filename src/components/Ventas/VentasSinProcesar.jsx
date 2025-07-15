// Importaciones React
import { useState, useEffect } from 'react';

// Estilos
import '../../styles/estilosGenerales.css';

// Importación de imágenes
import iconRegresar from '../../assets/images/png/regresar.png';
import iconRegresarTodos from '../../assets/images/png/regresar-todos.png';

// Importación de librerías
import { useSnackbar } from 'notistack';
import axios from 'axios';

const VentasSinProcesar = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [productosSinProcesar, setProductosSinProcesar] = useState([]);
  const [loading, setLoading] = useState(false);

  // Función para obtener productos sin procesar
  const fetchProductosSinProcesar = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/inventario/sin-procesar');
      setProductosSinProcesar(response.data);
      console.log('Productos sin procesar cargados:', response.data.length);
    } catch (error) {
      console.error('Error al obtener productos sin procesar:', error);
      enqueueSnackbar('Error al cargar productos sin procesar', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchProductosSinProcesar();
  }, []);

  // Función para regresar un producto individual al inventario
  const regresarProductoIndividual = async (productoId, marca, modelo) => {
    try {
      await axios.put(`http://localhost:5000/api/inventario/${productoId}`, {
        FK_ESTATUS_PRODUCTO: 1
      });

      // Actualizar la lista local removiendo el producto regresado
      setProductosSinProcesar(prev => 
        prev.filter(producto => producto.PK_PRODUCTO !== productoId)
      );

      enqueueSnackbar(`Producto ${marca} ${modelo} regresado al inventario`, { 
        variant: 'success' 
      });
    } catch (error) {
      console.error('Error al regresar producto individual:', error);
      enqueueSnackbar('Error al regresar el producto al inventario', { 
        variant: 'error' 
      });
    }
  };

  // Función para regresar TODOS los productos al inventario
  const regresarTodosLosProductos = async () => {
    if (productosSinProcesar.length === 0) {
      enqueueSnackbar('No hay productos sin procesar', { variant: 'warning' });
      return;
    }

    try {
      const response = await axios.put('http://localhost:5000/api/inventario/regresar-todos');
      
      // Limpiar la lista local
      setProductosSinProcesar([]);
      
      enqueueSnackbar(response.data.message, { variant: 'success' });
    } catch (error) {
      console.error('Error al regresar todos los productos:', error);
      enqueueSnackbar('Error al regresar todos los productos al inventario', { 
        variant: 'error' 
      });
    }
  };

  // Función para obtener el texto del estatus
  const obtenerTextoEstatus = (estatus) => {
    switch (estatus) {
      case 3:
        return 'Venta sin procesar';
      case 1:
        return 'Disponible';
      case 2:
        return 'Vendido';
      default:
        return 'Estado desconocido';
    }
  };

  return (
    <div className="page-container">
      <div className="header-section">
        <h2>Ventas Sin Procesar</h2>
        <p className="subtitle">
          Productos que quedaron en proceso de venta y necesitan ser regresados al inventario
        </p>
      </div>

      {/* Botón para regresar todos */}
      {productosSinProcesar.length > 0 && (
        <div className="actions-header">
          <button 
            className="btn-primary" 
            onClick={regresarTodosLosProductos}
            style={{ marginBottom: '20px' }}
          >
            <img src={iconRegresarTodos} alt="Regresar todos" />
            REGRESAR TODOS AL INVENTARIO ({productosSinProcesar.length})
          </button>
        </div>
      )}

      {/* Indicador de carga */}
      {loading && (
        <div className="loading-container">
          <p>Cargando productos sin procesar...</p>
        </div>
      )}

      {/* Tabla de productos sin procesar */}
      {!loading && productosSinProcesar.length > 0 && (
        <div className="table-container">
          <table className="productos-table">
            <thead>
              <tr>
                <th>Código de Barras</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Color</th>
                <th>Talla</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosSinProcesar.map((producto) => (
                <tr key={producto.PK_PRODUCTO}>
                  <td>{producto.CODIGO_BARRA}</td>
                  <td>{producto.MARCA}</td>
                  <td>{producto.MODELO}</td>
                  <td>{producto.COLOR}</td>
                  <td>{producto.TALLA}</td>
                  <td>${parseFloat(producto.PRECIO).toFixed(2)}</td>
                  <td>
                    <span className="status-badge status-warning">
                      {obtenerTextoEstatus(producto.FK_ESTATUS_PRODUCTO)}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => regresarProductoIndividual(
                        producto.PK_PRODUCTO, 
                        producto.MARCA, 
                        producto.MODELO
                      )}
                      title="Regresar al inventario"
                    >
                      <img src={iconRegresar}  alt="Regresar" />
                      Regresar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mensaje cuando no hay productos */}
      {!loading && productosSinProcesar.length === 0 && (
        <div className="empty-state">
          <div className="empty-message">
            <h3>¡Excelente!</h3>
            <p>No hay productos sin procesar en este momento.</p>
            <p>Todos los productos están correctamente en el inventario.</p>
          </div>
        </div>
      )}

      {/* Botón para refrescar */}
      <div className="refresh-section" style={{ marginTop: '20px' }}>
        <button 
          className="btn-secondary" 
          onClick={fetchProductosSinProcesar}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'Actualizar Lista'}
        </button>
      </div>
    </div>
  );
};

export default VentasSinProcesar;