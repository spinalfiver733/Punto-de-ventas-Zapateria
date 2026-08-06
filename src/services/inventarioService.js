import api from '../config/api';

export const getInventarioDisponible = async () => {
  const response = await api.get('/api/inventario');

  // Ya no filtramos aquí: el backend solo regresa productos con STOCK > 0
  return response.data.map(item => ({
    ...item,
    CODIGO_BARRA: item.CODIGO_BARRA || ''
  }));
};