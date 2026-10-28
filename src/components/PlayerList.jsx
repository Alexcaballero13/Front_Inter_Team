import React from 'react';
import StarRating from './StarRating';
import FormaIndicator from './FormaIndicator';

const PlayerList = ({ players, onEdit, onDelete }) => {
  return (
    <div className="player-list-container fade-in">
      {players.length === 0 ? (
        <p className="no-data">NO HAY JUGADORES REGISTRADOS</p>
      ) : (
        <div className="player-cards-list">
          {players.map(player => {
            const posDisplay = {
              'PORTERO': 'POR',
              'DEFENSA': 'DEF',
              'MEDIOCENTRO': 'MED',
              'DELANTERO': 'DEL'
            }[player.posicion] || player.posicion.substring(0, 3);

            return (
              <div key={player.id} className="player-admin-card">
                <div className="player-info">
                  <span className={`pos-badge pos-${posDisplay}`}>{posDisplay}</span>
                  <div className="player-details">
                    <h4>{player.nombre}</h4>
                    {player.nivelGeneral != null ? (
                      <>
                        <StarRating value={player.nivelGeneral} size={14} />
                        <p className="player-sub-stats">
                          ATQ {player.nivelAtaque} · DEF {player.nivelDefensa}
                          {' '}
                          <FormaIndicator nivelGeneral={player.nivelGeneral} nivelEfectivo={player.nivelEfectivo} />
                        </p>
                      </>
                    ) : (
                      <p className="player-sub-stats player-sub-stats--warning">⚠ SIN CALIFICAR</p>
                    )}
                  </div>
                </div>
                <div className="player-actions">
                  <button className="icon-btn edit" onClick={() => onEdit(player)} title="Editar">✏️</button>
                  <button className="icon-btn delete" onClick={() => onDelete(player.id)} title="Eliminar">🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlayerList;
