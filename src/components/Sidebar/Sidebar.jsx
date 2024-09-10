import { useState } from 'react';
import './Sidebar.css';
import iconVentas from '../../assets/images/svg/iconoVentasNegro.svg';
import iconInventario from '../../assets/images/svg/inventarioDisponibleNegro.svg';
import iconoConfig from '../../assets/images/svg/iconoConfiguracionNegro.svg';
import iconoReportes from '../../assets/images/svg/reporteNegro.svg';
import iconoMenu from '../../assets/images/svg/menu.svg';

const Sidebar = ({ setActiveComponent }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState('');
  

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
        <img src={iconoMenu} alt="Toggle menu" className="sidebar-icon" />
      </div>
      <ul>
        {menuItems.map((item) => (
          <li key={item.id}>
            <div 
              className={`menu-item ${activeItem === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveItem(item.id);
                setActiveComponent(item.id);
              }}
            >
              <img src={item.icon} alt={item.text} className="sidebar-icon" />
              {isExpanded && <span>{item.text}</span>}
            </div>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;