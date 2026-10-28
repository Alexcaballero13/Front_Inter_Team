export const generateTeams = (selectedPlayers) => {
  // Deep copy the array to avoid mutating React state directly
  const players = [...selectedPlayers];
  
  // Group players by position
  const byPosition = {
    'POR': players.filter(p => p.position === 'POR').sort((a,b) => b.overall - a.overall),
    'DEF': players.filter(p => p.position === 'DEF').sort((a,b) => b.overall - a.overall),
    'MED': players.filter(p => p.position === 'MED').sort((a,b) => b.overall - a.overall),
    'DEL': players.filter(p => p.position === 'DEL').sort((a,b) => b.overall - a.overall)
  };

  const teamA = [];
  const teamB = [];
  
  // To ensure fairness and slight randomness, we alternate which team gets the "better" player first in each positional pair
  let alternate = Math.random() > 0.5;

  ['POR', 'DEF', 'MED', 'DEL'].forEach(pos => {
    // Shuffle slightly while keeping overall power somewhat grouped to make it balanced but unpredictable
    const posPlayers = byPosition[pos];
    
    while(posPlayers.length >= 2) {
      // Pick 2 random players from the top 3 of this position (if available) to add variety
      const poolSize = Math.min(3, posPlayers.length);
      const idx1 = Math.floor(Math.random() * poolSize);
      const p1 = posPlayers.splice(idx1, 1)[0];
      
      const idx2 = Math.floor(Math.random() * Math.min(2, posPlayers.length));
      const p2 = posPlayers.splice(idx2, 1)[0];
      
      if (alternate) {
        teamA.push(p1);
        teamB.push(p2);
      } else {
        teamB.push(p1);
        teamA.push(p2);
      }
      alternate = !alternate;
    }
    
    // If one player remains
    if (posPlayers.length === 1) {
      if (teamA.length <= teamB.length) {
        teamA.push(posPlayers[0]);
      } else {
        teamB.push(posPlayers[0]);
      }
    }
  });

  return { teamA, teamB };
};
