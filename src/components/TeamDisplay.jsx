import React from 'react';
import './TeamDisplay.css';
import { api } from '../services/api';
import StarRating from './StarRating';

const TeamDisplay = ({ teamA, teamB, onReset, onReShuffle, onBackToDraft, onRegistered, role }) => {
  const [registering, setRegistering] = React.useState(false);
  const [registered, setRegistered] = React.useState(false);

  const handleRegister = async () => {
    setRegistering(true);
    try {
      const jugadoresConEquipo = [
        ...teamA.map(p => ({ nombre: p.nombre, equipo: 'LOCAL' })),
        ...teamB.map(p => ({ nombre: p.nombre, equipo: 'VISITANTE' })),
      ];
      await api.registerMatchDay(jugadoresConEquipo);
      setRegistered(true);
      alert('¡Partido registrado con éxito!');
      onRegistered();
    } catch (err) {
      console.error(err);
      alert('Error al registrar el partido');
    } finally {
      setRegistering(false);
    }
  };

  const renderTeam = (team, name, colorClass) => {
    const sumAtaque = team.reduce((sum, p) => sum + (p.nivelAtaque || 0), 0);
    const sumDefensa = team.reduce((sum, p) => sum + (p.nivelDefensa || 0), 0);

    return (
      <div className={`team-container ${colorClass}`}>
        <div className="team-header">
          <h2 className="team-name">{name}</h2>
          <div className="team-stats">
            <span>{team.length} JUGADORES</span>
            {role === 'ADMIN' && (
              <>
                <span style={{ margin: '0 8px', opacity: 0.5 }}>|</span>
                <span className="team-stat-chip team-stat-chip--atk">ATQ {sumAtaque}</span>
                <span className="team-stat-chip team-stat-chip--def">DEF {sumDefensa}</span>
              </>
            )}
          </div>
        </div>
        <div className="team-roster">
          {team.map((player, index) => {
            const posDisplay = {
              'PORTERO': 'POR',
              'DEFENSA': 'DEF',
              'MEDIOCENTRO': 'MED',
              'DELANTERO': 'DEL'
            }[player.posicion] || player.posicion?.substring(0, 3);

            return (
              <div key={player.id} className="roster-item" style={{ animationDelay: `${index * 0.1}s` }}>
                <span className={`roster-pos pos-${posDisplay}`}>{posDisplay}</span>
                <span className="roster-name">{player.nombre}</span>
                {role === 'ADMIN' && <StarRating value={player.nivelGeneral} size={12} className="roster-ovr" />}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="teams-match-view fade-in">
      <div className="match-header-actions">
        <button className="btn-back-mini" onClick={onBackToDraft}>← VOLVER</button>
        <div className="versus-banner">MATCHDAY</div>
      </div>
      
      <div className="pitch-layout">
        {renderTeam(teamA, 'EQUIPO LOCAL', 'team-local')}
        <div className="vs-separator">
          <div className="vs-circle">VS</div>
        </div>
        {renderTeam(teamB, 'EQUIPO VISITANTE', 'team-away')}
      </div>

      <div className="footer-match-actions">
        {!registered ? (
          <>
            <button 
              className={`btn btn-confirm ${role !== 'ADMIN' ? 'disabled' : ''}`} 
              onClick={handleRegister} 
              disabled={registering || role !== 'ADMIN'}
            >
              {registering ? 'REGISTRANDO...' : 
               role !== 'ADMIN' ? 'REGISTRO SOLO PARA ADMINS' : 'CONFIRMAR Y REGISTRAR PARTIDO'}
            </button>
            <button className="btn btn-outline" onClick={onReShuffle}>
              NUEVO SORTEO ↻
            </button>
          </>
        ) : (
          <div className="registration-success">✓ PARTIDO REGISTRADO - VOLVIENDO AL INICIO...</div>
        )}
      </div>
    </div>
  );
};

export default TeamDisplay;
