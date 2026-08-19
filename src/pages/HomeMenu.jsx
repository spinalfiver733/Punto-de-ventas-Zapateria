import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/estilosPages/HomeMenu.css';

function HomeMenu() {
  return (
    <div className="home-menu-page">

      {/* Franja superior */}
      <header className="home-menu-topbar">
        <h2 className="home-menu-topbar-title">Punto de venta</h2>
      </header>

      <div className="home-menu-content">
        <h1 className="home-menu-title">Bienvenido al Sistema</h1>
        <p className="home-menu-subtitle">Selecciona a dónde deseas dirigirte:</p>

        <div className="home-menu-buttons-grid">

          {/* Card 1 */}
          <Link to="/ventas_dia" className="menu-card">
            <div className="menu-card-header">Ventas</div>
            <div className="menu-card-body">
              <img
                src="/ventas.png"
                alt="Ventas del día"
                className="menu-card-img"
              />
              <span className="menu-card-title">Ver Ventas del Día</span>
              <span className="menu-card-desc">Acceder al registro y gestión de ventas diarias.</span>
            </div>
          </Link>

          {/* Card 2 */}
          <Link to="/inventario" className="menu-card">
            <div className="menu-card-header">Inventario</div>
            <div className="menu-card-body">
              <img
                src="/inventario.png"
                alt="Inventario público"
                className="menu-card-img"
              />
              <span className="menu-card-title">Ver Inventario Público</span>
              <span className="menu-card-desc">Consultar existencias para el público.</span>
            </div>
          </Link>

          {/* Card 3 */}
          <Link to="/app" className="menu-card">
            <div className="menu-card-header">Dashboard</div>
            <div className="menu-card-body">
              <img
                src="/dashboard.png"
                alt="Dashboard"
                className="menu-card-img"
              />
              <span className="menu-card-title">Ir al Dashboard</span>
              <span className="menu-card-desc">Ver resumen general y estadísticas.</span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default HomeMenu;