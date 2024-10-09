import React, { createContext, useState, useContext } from 'react';

const VentaContext = createContext();

export const VentaProvider = ({ children }) => {
  const [ventaEnProgreso, setVentaEnProgreso] = useState(false);

  const iniciarVenta = () => setVentaEnProgreso(true);
  const finalizarVenta = () => setVentaEnProgreso(false);

  return (
    <VentaContext.Provider value={{ ventaEnProgreso, iniciarVenta, finalizarVenta }}>
      {children}
    </VentaContext.Provider>
  );
};

export const useVenta = () => useContext(VentaContext);