import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/estilosPages/HomeMenu.css'; // <--- Importamos tu nuevo archivo CSS independiente

function HomeMenu() {
  return (
    <div className="home-menu-page">
      <h1 className="home-menu-title">Bienvenido al Sistema</h1>
      <p className="home-menu-subtitle">Selecciona a dónde deseas dirigirte:</p>
      
      <div className="home-menu-buttons-grid">
        
        {/* Botón 1 */}
        <Link to="/app" className="btn-primary-menu">
          Ir al Dashboard
        </Link>

        {/* Botón 2 */}
        <Link to="/ventas_dia" className="btn-primary-menu">
          Ver Ventas del Día
        </Link>

        {/* Botón 3 */}
        <Link to="/inventario" className="btn-primary-menu">
          Ver Inventario Público
        </Link>
        
      </div>
    </div>
  );
}

export default HomeMenu;