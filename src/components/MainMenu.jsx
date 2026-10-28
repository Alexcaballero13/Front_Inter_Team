import React from 'react';
import './MainMenu.css';

const MainMenu = ({ role, onNavigate, onLogout }) => {
  const isAdmin = role === 'ADMIN';

  return (
    <div className="menu-container fade-in">
      <header className="menu-header">
        <div className="app-title">
          <span className="title-sub">BIENVENIDO</span>
          <h1 className="title-main">MENÚ PRINCIPAL</h1>
        </div>
        <button className="btn btn-logout" onClick={onLogout}>SALIR</button>
      </header>

      <main className="menu-grid">
        <button 
          className={`menu-card ${!isAdmin ? 'disabled' : ''}`} 
          onClick={() => isAdmin && onNavigate('players')}
          disabled={!isAdmin}
        >
          <div className="card-icon">👥</div>
          <div className="card-content">
            <h3>Gestión Jugadores</h3>
            <p>{isAdmin ? 'Administrar el plantel' : 'Solo lectura (Próximamente)'}</p>
          </div>
        </button>

        <button 
          className="menu-card" 
          onClick={() => onNavigate('draft')}
        >
          <div className="card-icon">⚡</div>
          <div className="card-content">
            <h3>Generar Sorteo</h3>
            <p>Crear equipos equilibrados</p>
          </div>
        </button>

        <button 
          className="menu-card highlight" 
          onClick={() => onNavigate('reports')}
        >
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Reporte Asistencia</h3>
            <p>Ver estadísticas mensuales</p>
          </div>
        </button>
      </main>

      <div className="jamaica-stripes-fixed">
        <div className="stripe green"></div>
        <div className="stripe yellow"></div>
        <div className="stripe red"></div>
      </div>
    </div>
  );
};

export default MainMenu;
