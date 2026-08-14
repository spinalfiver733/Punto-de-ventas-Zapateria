import React from 'react';
import './Sidebar.css';
import iconVentas from '../../assets/images/svg/iconoVentasNegro_gray.svg';
import iconVentasActive from '../../assets/images/svg/iconoVentasNegro_naranja.svg';
import iconInventario from '../../assets/images/svg/inventarioDisponibleNegro_gray.svg';
import iconInventarioActive from '../../assets/images/svg/inventarioDisponibleNegro_naranja.svg';
import iconoConfig from '../../assets/images/svg/iconoConfiguracionNegro_gray.svg';
import iconoConfigActive from '../../assets/images/svg/iconoConfiguracionNegro_naranja.svg';
import iconoDevolucion from '../../assets/images/svg/iconoDevolucion_gray.svg';
import iconoDevolucionActive from '../../assets/images/svg/iconoDevolucion_naranja.svg';
import iconoReportes from '../../assets/images/svg/reporteNegro_gray.svg';
import iconoReportesActive from '../../assets/images/svg/reporteNegro_naranja.svg';
import iconoMenu from '../../assets/images/svg/menu_blanco_gray.svg';

const Sidebar = ({ isExpanded, setIsExpanded, activeComponent, setActiveComponent }) => {
  const menuItems = [
    { id: 'ventas', icon: iconVentas, iconActive: iconVentasActive, text: 'VENTAS' },
    { id: 'inventario', icon: iconInventario, iconActive: iconInventarioActive, text: 'INVENTARIO' },
    { id: 'devoluciones', icon: iconoDevolucion, iconActive: iconoDevolucionActive, text: 'DEVOLUCIONES' },
    { id: 'reportes', icon: iconoReportes, iconActive: iconoReportesActive, text: 'REPORTES' },
    { id: 'configuracion', icon: iconoConfig, iconActive: iconoConfigActive, text: 'CONFIGURACIÓN' },
  ];

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <nav className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="menu-toggle" onClick={toggleSidebar}>
          <img src={iconoMenu} alt="Toggle menu" className="sidebar-icon menu-icon" />
        </div>
      <ul>
        {menuItems.map((item) => (
          <li key={item.id}>
            <div
              className={`menu-item ${activeComponent === item.id ? 'active' : ''}`}
              onClick={() => setActiveComponent(item.id)}
            >
              {isExpanded && <span>{item.text}</span>}
              <img
                src={activeComponent === item.id ? item.iconActive : item.icon}
                alt={item.text}
                className="sidebar-icon"
              />
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;