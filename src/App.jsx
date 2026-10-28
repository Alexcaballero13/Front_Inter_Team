import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import MainMenu from './components/MainMenu';
import PlayerCard from './components/PlayerCard';
import TeamDisplay from './components/TeamDisplay';
import MatchSummary from './components/MatchSummary';
import ReportSection from './components/ReportSection';
import PlayerManagement from './components/PlayerManagement';
import { api } from './services/api';
import { ordenarPorPosicion } from './utils/ordenarJugadores';
import './App.css';

function App() {
  const [appState, setAppState] = useState('landing'); // 'landing', 'login', 'menu', 'draft', 'match', 'reports', 'players'
  const [userRole, setUserRole] = useState(null);
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [teams, setTeams] = useState({ teamA: [], teamB: [] });
  const [loading, setLoading] = useState(false);
  
  const MIN_PLAYERS = 12;
  const MAX_PLAYERS = 18;

  useEffect(() => {
    if (appState === 'draft' || appState === 'reports' || appState === 'players') {
      fetchPlayers();
    }
  }, [appState]);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const data = await api.getPlayers();
      setPlayers(ordenarPorPosicion(data));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    setAppState('menu');
  };

  const handleLogout = () => {
    api.logout();
    setAppState('landing');
    setUserRole(null);
  };

  const togglePlayer = (player) => {
    if (selectedPlayers.find(p => p.id === player.id)) {
      setSelectedPlayers(selectedPlayers.filter(p => p.id !== player.id));
    } else {
      if (selectedPlayers.length < MAX_PLAYERS) {
        setSelectedPlayers([...selectedPlayers, player]);
      }
    }
  };

  // El sorteo no balancea con la estrella manual pura: usa nivelEfectivo (manual
  // ajustado por el historial real de resultados), repartiendo la diferencia por
  // igual entre ataque y defensa (el backend calcula un solo ajuste combinado,
  // no uno separado por ataque y por defensa). Suma, no multiplica: con un
  // factor multiplicativo, un jugador con nivel manual bajo y mal historial
  // podía terminar aportando 0 al balanceo aunque siguiera ocupando un cupo.
  const ajusteEfectivo = (p) => {
    if (p.nivelEfectivo == null || p.nivelGeneral == null) return 0;
    return p.nivelEfectivo - p.nivelGeneral;
  };

  const handleGenerate = () => {
    const playersByPos = { 'PORTERO': [], 'DEFENSA': [], 'MEDIOCENTRO': [], 'DELANTERO': [] };

    // Shuffle the array to allow for non-deterministic identical-optimal formations
    const shuffled = [...selectedPlayers].sort(() => Math.random() - 0.5);
    shuffled.forEach(p => playersByPos[p.posicion].push(p));

    // Ya no balanceamos un solo "nivel" general: cada jugador aporta dos
    // números independientes (Ataque y Defensa). Buscamos la partición que,
    // en orden de prioridad:
    //  1) deje la Defensa más pareja posible entre los dos equipos (una
    //     defensa floja concede goles en racha, pesa más en el marcador real)
    //  2) entre las que empatan en eso, deje el Ataque más parejo posible
    let bestDiffDefensa = Infinity;
    let bestDiffAtaque = Infinity;
    let bestTeamA = [];
    let bestTeamB = [];
    let numOptimal = 0;

    const targetMaxTotal = Math.ceil(shuffled.length / 2);
    const posCountersA = { 'PORTERO': 0, 'DEFENSA': 0, 'MEDIOCENTRO': 0, 'DELANTERO': 0 };
    const posCountersB = { 'PORTERO': 0, 'DEFENSA': 0, 'MEDIOCENTRO': 0, 'DELANTERO': 0 };

    // Backtracking function to exhaustively find the absolute best partition
    const backtrack = (index, currentTeamA, currentTeamB, atkA, defA, atkB, defB) => {
      if (index === shuffled.length) {
        const diffDefensa = Math.abs(defA - defB);
        const diffAtaque = Math.abs(atkA - atkB);

        const esMejor =
          diffDefensa < bestDiffDefensa ||
          (diffDefensa === bestDiffDefensa && diffAtaque < bestDiffAtaque);

        if (esMejor) {
          bestDiffDefensa = diffDefensa;
          bestDiffAtaque = diffAtaque;
          bestTeamA = [...currentTeamA];
          bestTeamB = [...currentTeamB];
          numOptimal = 1;
        } else if (diffDefensa === bestDiffDefensa && diffAtaque === bestDiffAtaque) {
          numOptimal++;
          // Reservoir sampling guarantees fair randomness among all optimal solutions
          if (Math.random() < 1 / numOptimal) {
            bestTeamA = [...currentTeamA];
            bestTeamB = [...currentTeamB];
          }
        }
        return;
      }

      const p = shuffled[index];
      const pos = p.posicion;
      // Max players a specific team can have of this position to stay perfectly paired
      const maxPos = Math.ceil(playersByPos[pos].length / 2);

      const ajuste = ajusteEfectivo(p);
      const ataquePonderado = p.nivelAtaque + ajuste;
      const defensaPonderada = p.nivelDefensa + ajuste;

      // Try assigning to Team A
      if (currentTeamA.length < targetMaxTotal && posCountersA[pos] < maxPos) {
        currentTeamA.push(p);
        posCountersA[pos]++;
        backtrack(index + 1, currentTeamA, currentTeamB, atkA + ataquePonderado, defA + defensaPonderada, atkB, defB);
        posCountersA[pos]--;
        currentTeamA.pop();
      }

      // Try assigning to Team B
      if (currentTeamB.length < targetMaxTotal && posCountersB[pos] < maxPos) {
        currentTeamB.push(p);
        posCountersB[pos]++;
        backtrack(index + 1, currentTeamA, currentTeamB, atkA, defA, atkB + ataquePonderado, defB + defensaPonderada);
        posCountersB[pos]--;
        currentTeamB.pop();
      }
    };

    backtrack(0, [], [], 0, 0, 0, 0);

    const teamA = bestTeamA;
    const teamB = bestTeamB;

    // 5. Sort final teams by position (POR -> DEF -> MED -> DEL) and then by nivel general
    const posOrder = { 'PORTERO': 1, 'DEFENSA': 2, 'MEDIOCENTRO': 3, 'DELANTERO': 4 };
    const sortFn = (a, b) => {
      if (posOrder[a.posicion] !== posOrder[b.posicion]) {
        return posOrder[a.posicion] - posOrder[b.posicion];
      }
      return b.nivelGeneral - a.nivelGeneral;
    };

    teamA.sort(sortFn);
    teamB.sort(sortFn);

    setTeams({ teamA, teamB });
    setAppState('match');
  };

  if (appState === 'landing') {
    return <LandingPage onEnter={() => setAppState('login')} />;
  }

  if (appState === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (appState === 'menu') {
    return <MainMenu role={userRole} onNavigate={setAppState} onLogout={handleLogout} />;
  }

  if (appState === 'reports') {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="app-title">
            <span className="title-sub">ESTADÍSTICAS</span>
            <h1 className="title-main">REPORTES</h1>
          </div>
          <button className="btn btn-logout" onClick={() => setAppState('menu')}>VOLVER</button>
        </header>
        <main className="main-content">
          <ReportSection userRole={userRole} />
        </main>
      </div>
    );
  }


  if (appState === 'players') {
    return <PlayerManagement onBack={() => setAppState('menu')} />;
  }

  if (appState === 'summary') {
    return <MatchSummary teamA={teams.teamA} teamB={teams.teamB} onBackToMenu={() => setAppState('menu')} />;
  }

  return (
    <div className="app-container">
      {appState === 'draft' ? (
        <>
          <header className="app-header fade-in">
            <div className="app-title">
              <span className="title-sub">DRAFT MODO</span>
              <h1 className="title-main">INTER TEAM</h1>
            </div>
            <button className="btn btn-logout" onClick={() => setAppState('menu')}>VOLVER</button>
          </header>

          <main className="main-content players-grid fade-in">
            {loading ? (
              <p style={{ gridColumn: '1/-1', textAlign: 'center' }}>CARGANDO JUGADORES...</p>
            ) : (
              players.map(player => (
                <PlayerCard 
                  key={player.id}
                  player={player}
                  isSelected={!!selectedPlayers.find(p => p.id === player.id)}
                  onToggle={togglePlayer}
                  disabled={selectedPlayers.length >= MAX_PLAYERS}
                />
              ))
            )}
          </main>

          <div className="footer-actions fade-in">
            <button 
              className="btn" 
              onClick={handleGenerate}
              disabled={selectedPlayers.length < MIN_PLAYERS || selectedPlayers.length > MAX_PLAYERS}
            >
              {selectedPlayers.length >= MIN_PLAYERS ? 'GENERAR SORTEO ⚡' : `FALTAN ${MIN_PLAYERS - selectedPlayers.length} JUGADOR(ES) MIN`}
            </button>
          </div>
        </>
      ) : (
        <TeamDisplay 
          teamA={teams.teamA} 
          teamB={teams.teamB} 
          onReset={() => setAppState('menu')} 
          onReShuffle={handleGenerate}
          onBackToDraft={() => setAppState('draft')}
          onRegistered={() => setAppState('summary')}
          role={userRole}
        />
      )}
    </div>
  );
}

export default App;
