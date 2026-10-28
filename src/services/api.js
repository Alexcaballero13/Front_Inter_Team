// La URL se toma del entorno:
//  - En desarrollo (npm run dev): usa .env.development → http://localhost:8080/api
//  - En producción (npm run build): usa .env.production → URL del backend desplegado
const BASE_URL = import.meta.env.VITE_API_URL || 'https://back-inter-team.onrender.com/api';

const getAuthHeader = () => {
  const credentials = sessionStorage.getItem('credentials');
  return credentials ? { 'Authorization': `Basic ${credentials}` } : {};
};

export const api = {
  login: async (username, password) => {
    const credentials = btoa(`${username}:${password}`);
    const response = await fetch(`${BASE_URL}/jugadores`, {
      headers: { 'Authorization': `Basic ${credentials}` }
    });
    
    if (response.ok) {
      sessionStorage.setItem('credentials', credentials);
      sessionStorage.setItem('username', username);
      const isAdmin = ['Alex', 'Roberto', 'Fifo', 'Pinto'].includes(username);
      sessionStorage.setItem('role', isAdmin ? 'ADMIN' : 'VIEWER');
      return { ok: true, role: isAdmin ? 'ADMIN' : 'VIEWER' };
    }
    return { ok: false };
  },

  logout: () => {
    sessionStorage.clear();
  },

  getPlayers: async () => {
    const response = await fetch(`${BASE_URL}/jugadores`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch players');
    return response.json();
  },

  createPlayer: async (player) => {
    const response = await fetch(`${BASE_URL}/jugadores`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(player)
    });
    if (!response.ok) throw new Error('Failed to create player');
    return response.json();
  },

  updatePlayer: async (id, player) => {
    const response = await fetch(`${BASE_URL}/jugadores/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(player)
    });
    if (!response.ok) throw new Error('Failed to update player');
    return response.json();
  },

  deletePlayer: async (id) => {
    const response = await fetch(`${BASE_URL}/jugadores/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to delete player');
  },

  // jugadoresConEquipo: [{ nombre, equipo: 'LOCAL' | 'VISITANTE' }, ...]
  registerMatchDay: async (jugadoresConEquipo) => {
    const response = await fetch(`${BASE_URL}/matchdays`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jugadores: jugadoresConEquipo })
    });
    if (!response.ok) throw new Error('Failed to register MatchDay');
    return response.json();
  },

  registrarMarcador: async (matchDayId, golesLocal, golesVisitante) => {
    const response = await fetch(`${BASE_URL}/matchdays/${matchDayId}/marcador`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ golesLocal, golesVisitante })
    });
    if (!response.ok) throw new Error('Failed to register score');
    return response.json();
  },

  // jugadoresConEquipo: [{ nombre, equipo: 'LOCAL' | 'VISITANTE' }, ...]
  // Reemplaza el roster completo del MatchDay (para agregar/quitar jugadores
  // después de confirmado el partido, cuando la realidad cambió).
  actualizarJugadoresMatchDay: async (matchDayId, jugadoresConEquipo) => {
    const response = await fetch(`${BASE_URL}/matchdays/${matchDayId}/jugadores`, {
      method: 'PUT',
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ jugadores: jugadoresConEquipo })
    });
    if (!response.ok) throw new Error('Failed to update MatchDay players');
    return response.json();
  },

  getReport: async (month, year) => {
    const response = await fetch(`${BASE_URL}/reportes/partidos-por-mes?mes=${month}&anio=${year}`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch report');
    return response.json();
  },

  getAbsenteesReport: async (month, year) => {
    const response = await fetch(`${BASE_URL}/reportes/ausentes-por-mes?mes=${month}&anio=${year}`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch absentees report');
    return response.json();
  },

  getMatchDays: async () => {
    const response = await fetch(`${BASE_URL}/matchdays`, {
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to fetch match days');
    return response.json();
  },

  deleteMatchDay: async (id) => {
    const response = await fetch(`${BASE_URL}/matchdays/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to delete match day');
  },
};
