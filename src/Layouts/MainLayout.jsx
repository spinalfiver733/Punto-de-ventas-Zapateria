import { useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Ventas from '../components/Ventas/Ventas';
import Inventario from '../components/Inventario/Inventario'
import Reportes from '../components/Reportes/Reportes';
import Configuracion from '../components/Configuracion/Configuracion'
import './MainLayout.css';

const MainLayout = () => {
  const [activeComponent, setActiveComponent] = useState('ventas');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const renderComponent = () => {
    switch(activeComponent) {
      case 'ventas':
        return <Ventas/>;
      case 'inventario':
        // return <Inventario />;
        return <Inventario/>;
      case 'reportes':
        // return <Reportes />;
        return <Reportes/>;
      case 'configuracion':
        // return <Configuracion />;
        return <Configuracion/>;
      default:
        return <Ventas />;
    }
  };

  return (
    <div className="main-layout">
      <Sidebar 
        setActiveComponent={setActiveComponent}
        activeComponent={activeComponent}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />
      <main className="content" style={{ marginLeft: isSidebarExpanded ? '250px' : '60px' }}>
        {renderComponent()}
      </main>
    </div>
  );
};

export default MainLayout;