import React from 'react';
import './Sidebar.css';
import iconVentas from '../../assets/images/svg/iconoVentasNegro.svg';
import iconInventario from '../../assets/images/svg/inventarioDisponibleNegro.svg';
import iconoConfig from '../../assets/images/svg/iconoConfiguracionNegro.svg';
import iconoReportes from '../../assets/images/svg/reporteNegro.svg';
import iconoMenu from '../../assets/images/svg/menu.svg';

const Sidebar = ({ isExpanded, setIsExpanded, activeComponent, setActiveComponent }) => {
  const menuItems = [
    { id: 'ventas', icon: iconVentas, text: 'VENTAS' },
    { id: 'inventario', icon: iconInventario, text: 'INVENTARIO' },
    { id: 'reportes', icon: iconoReportes, text: 'REPORTES' },
    { id: 'configuracion', icon: iconoConfig, text: 'CONFIGURACIÓN' },
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
              <img src={item.icon} alt={item.text} className="sidebar-icon" />
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;