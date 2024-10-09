import { useState, useCallback } from 'react';
import { useVenta } from '../context/VentaContext';
import Sidebar from '../components/Sidebar/Sidebar';
import Ventas from '../components/Ventas/Ventas';
import Inventario from '../components/Inventario/Inventario';
import Reportes from '../components/Reportes/Reportes';
import Configuracion from '../components/Configuracion/Configuracion';
import ConfirmDialog from '../components/common/ConfirmDialog';
import './MainLayout.css';

const MainLayout = () => {
  const [activeComponent, setActiveComponent] = useState('ventas');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingComponent, setPendingComponent] = useState(null);
  const { ventaEnProgreso } = useVenta();
  const [cancelVenta, setCancelVenta] = useState(() => () => {});

  const handleComponentChange = (newComponent) => {
    if (ventaEnProgreso && activeComponent === 'ventas') {
      setShowConfirmDialog(true);
      setPendingComponent(newComponent);
    } else {
      setActiveComponent(newComponent);
    }
  };

  const handleConfirmNavigation = async () => {
    await cancelVenta();
    setActiveComponent(pendingComponent);
    setShowConfirmDialog(false);
  };

  const handleCancelNavigation = () => {
    setShowConfirmDialog(false);
  };

  const onCancelVenta = useCallback((cancelFunction) => {
    setCancelVenta(() => cancelFunction);
  }, []);

  const renderComponent = () => {
    switch(activeComponent) {
      case 'ventas':
        return <Ventas onCancelVenta={onCancelVenta} />;
      case 'inventario':
        return <Inventario />;
      case 'reportes':
        return <Reportes />;
      case 'configuracion':
        return <Configuracion />;
      default:
        return <Ventas onCancelVenta={onCancelVenta} />;
    }
  };

  return (
    <div className="main-layout">
      <Sidebar 
        setActiveComponent={handleComponentChange}
        activeComponent={activeComponent}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
      />
      <main className="content" style={{ marginLeft: isSidebarExpanded ? '250px' : '60px' }}>
        {renderComponent()}
      </main>
      <ConfirmDialog
        open={showConfirmDialog}
        onConfirm={handleConfirmNavigation}
        onCancel={handleCancelNavigation}
        title="Venta en progreso"
        content="Hay una venta en progreso. ¿Estás seguro de que quieres salir? Los cambios no guardados se perderán."
      />
    </div>
  );
};

export default MainLayout;