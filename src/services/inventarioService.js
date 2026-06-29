import api from '../config/api';

export const getInventarioDisponible = async () => {
  const response = await api.get('/api/inventario');
  
  // Aquí dejas el filtrado y formateo para que la vista reciba los datos limpios
  return response.data
    .filter(item => item.FK_ESTATUS_PRODUCTO === 1)
    .map(item => ({
      ...item,
      CODIGO_BARRA: item.CODIGO_BARRA || ''
    }));
};