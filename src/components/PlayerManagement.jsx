import React, { useState, useEffect } from 'react';
import PlayerList from './PlayerList';
import PlayerForm from './PlayerForm';
import { api } from '../services/api';
import { ordenarPorPosicion } from '../utils/ordenarJugadores';
import './PlayerManagement.css';

const PlayerManagement = ({ onBack }) => {
  const [view, setView] = useState('menu'); // 'menu', 'list', 'create', 'edit'
  const [players, setPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (view === 'list' || view === 'menu') {
      fetchPlayers();
    }
  }, [view]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const data = await api.getPlayers();
      setPlayers(ordenarPorPosicion(data));
    } catch (err) {
      setError('Error al cargar jugadores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (playerData) => {
    try {
      await api.createPlayer(playerData);
      setView('list');
    } catch (err) {
      setError('Error al crear jugador');
    }
  };

  const handleUpdate = async (playerData) => {
    try {
      await api.updatePlayer(selectedPlayer.id, playerData);
      setView('list');
      setSelectedPlayer(null);
    } catch (err) {
      setError('Error al actualizar jugador');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro que quiere eliminar este jugador?')) {
      try {
        await api.deletePlayer(id);
        fetchPlayers();
      } catch (err) {
        setError('Error al eliminar jugador');
      }
    }
  };

  const handleEditClick = (player) => {
    setSelectedPlayer(player);
    setView('edit');
  };

  return (
    <div className="player-mgmt-container fade-in">
      <header className="mgmt-header">
        <div className="app-title">
          <span className="title-sub">ADMINISTRACIÓN</span>
          <h1 className="title-main">
            {view === 'menu' && 'GESTIÓN JUGADORES'}
            {view === 'list' && 'LISTA JUGADORES'}
            {view === 'create' && 'NUEVO JUGADOR'}
            {view === 'edit' && 'EDITAR JUGADOR'}
          </h1>
        </div>
        <button className="btn btn-logout" onClick={() => view === 'menu' ? onBack() : setView('menu')}>
          {view === 'menu' ? 'VOLVER' : 'CERRAR'}
        </button>
      </header>

      <main className="mgmt-content">
        {error && <p className="error-message">{error}</p>}
        
        {view === 'menu' && (
          <div className="mgmt-menu">
            <button className="menu-card" onClick={() => setView('list')}>
              <div className="card-icon">📋</div>
              <div className="card-content">
                <h3>Lista de Jugadores</h3>
                <p>Ver, editar o eliminar</p>
              </div>
            </button>
            <button className="menu-card" onClick={() => setView('create')}>
              <div className="card-icon">➕</div>
              <div className="card-content">
                <h3>Crear Nuevo Jugador</h3>
                <p>Añadir al plantel</p>
              </div>
            </button>
          </div>
        )}

        {view === 'list' && (
          loading ? <p className="loading">Cargando...</p> : 
          <PlayerList players={players} onEdit={handleEditClick} onDelete={handleDelete} />
        )}

        {view === 'create' && (
          <PlayerForm onSubmit={handleCreate} onCancel={() => setView('menu')} />
        )}

        {view === 'edit' && (
          <PlayerForm player={selectedPlayer} onSubmit={handleUpdate} onCancel={() => setView('list')} />
        )}
      </main>
    </div>
  );
};

export default PlayerManagement;
