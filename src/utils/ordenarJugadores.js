const ORDEN_POSICION = {
  PORTERO: 0,
  DEFENSA: 1,
  MEDIOCENTRO: 2,
  DELANTERO: 3,
};

// Orden táctico: porteros, defensas, mediocentros y delanteros. Se usa tanto
// en el listado de gestión de jugadores como en la selección del sorteo.
export const ordenarPorPosicion = (jugadores) => {
  return [...jugadores].sort((a, b) => {
    const ordenA = ORDEN_POSICION[a.posicion] ?? Number.MAX_SAFE_INTEGER;
    const ordenB = ORDEN_POSICION[b.posicion] ?? Number.MAX_SAFE_INTEGER;
    return ordenA - ordenB;
  });
};
