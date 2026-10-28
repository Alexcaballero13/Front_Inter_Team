import React, { useLayoutEffect, useRef, useState } from 'react';
import './PlayerCard.css';
import FormaIndicator from './FormaIndicator';

const PlayerCard = ({ player, isSelected, onToggle, disabled }) => {
  // Jugadores migrados del sistema anterior que todavía no tienen Ataque/Defensa
  // cargados no se pueden meter al sorteo (rompería el balanceo del algoritmo).
  const sinCalificar = player.nivelGeneral === null || player.nivelGeneral === undefined;

  // El nombre puede partirse en 2 líneas (ver .player-name). Dentro de un
  // flex, el navegador le da a esa caja más ancho del que el texto
  // realmente necesita para partirse así (no se ajusta al contenido como
  // haría un elemento normal fuera de un flex) — eso deja un hueco entre
  // el texto y la flecha de forma. Medimos cuánto ocupa de verdad la línea
  // más larga y fijamos ese ancho exacto, para que la flecha quede pegada.
  const nameRef = useRef(null);
  const [pinnedWidth, setPinnedWidth] = useState(null);

  useLayoutEffect(() => {
    const el = nameRef.current;
    if (!el) return;

    const medir = () => {
      // Soltar el ancho fijado antes de medir, si no mediríamos sobre
      // el ancho que nosotros mismos le pusimos la vez anterior.
      el.style.width = 'auto';
      const range = document.createRange();
      range.selectNodeContents(el);
      const rects = Array.from(range.getClientRects());
      if (rects.length === 0) return;
      const anchoNecesario = Math.max(...rects.map((r) => r.width));
      setPinnedWidth(Math.ceil(anchoNecesario));
    };

    medir();
    window.addEventListener('resize', medir);
    return () => window.removeEventListener('resize', medir);
  }, [player.nombre]);

  return (
    <div
      className={`player-card ${isSelected ? 'selected' : ''} ${(disabled || sinCalificar) && !isSelected ? 'disabled' : ''}`}
      onClick={() => {
        if (sinCalificar) return;
        if (!disabled || isSelected) {
          onToggle(player);
        }
      }}
    >
      <div className="card-left">
        {(() => {
          const posDisplay = {
            'PORTERO': 'POR',
            'DEFENSA': 'DEF',
            'MEDIOCENTRO': 'MED',
            'DELANTERO': 'DEL'
          }[player.posicion] || player.posicion?.substring(0, 3);
          return <span className={`pos-badge pos-${posDisplay}`}>{posDisplay}</span>;
        })()}
        <div className="player-name-wrap">
          <h3
            className="player-name"
            ref={nameRef}
            style={pinnedWidth != null ? { width: `${pinnedWidth}px` } : undefined}
          >
            {player.nombre}
          </h3>
          <FormaIndicator nivelGeneral={player.nivelGeneral} nivelEfectivo={player.nivelEfectivo} compact />
        </div>
        {sinCalificar && <span className="player-card-warning" title="Falta calificar Ataque/Defensa">⚠</span>}
      </div>
      <div className="selection-indicator">
        <div className="checkbox-inner"></div>
      </div>
    </div>
  );
};

export default PlayerCard;
