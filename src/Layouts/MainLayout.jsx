import { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Ventas from '../components/Ventas/Ventas';
import './MainLayout.css';

const MainLayout = () => {
  const [activeComponent, setActiveComponent] = useState('ventas');

  const renderComponent = () => {
    switch(activeComponent) {
      case 'ventas':
        return <Ventas />;
      case 'inventario':
        // return <Inventario />;
        return <h2>Inventario (Componente por implementar)</h2>;
      case 'reportes':
        // return <Reportes />;
        return <h2>Reportes (Componente por implementar)</h2>;
      case 'configuracion':
        // return <Configuracion />;
        return <h2>Configuración (Componente por implementar)</h2>;
      default:
        return <Ventas />; // Cambiamos esto para que siempre muestre algo válido
    }
  };

  return (
    <div className="main-layout">
      <Sidebar setActiveComponent={setActiveComponent} />
      <main className="content">
        {renderComponent()}
      </main>
    </div>
  );
};

export default MainLayout;