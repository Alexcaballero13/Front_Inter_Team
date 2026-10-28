import React from 'react';
import './FormaIndicator.css';

// Muestra cuánto se aleja el nivelEfectivo (ajustado por resultados reales)
// del nivelGeneral manual que puso el admin. Solo tiene sentido mostrarlo
// cuando la diferencia ya es perceptible; con poco historial, el backend deja
// nivelEfectivo prácticamente igual a nivelGeneral y aquí no se muestra nada.
const FormaIndicator = ({ nivelGeneral, nivelEfectivo, compact = false }) => {
  if (nivelGeneral == null || nivelEfectivo == null) return null;

  const diferencia = nivelEfectivo - nivelGeneral;
  if (Math.abs(diferencia) < 0.05) return null;

  const subiendo = diferencia > 0;
  // Tope real del ajuste en el backend (RatingService): peso máximo del
  // historial (0.6) × ajuste acumulado máximo (2.0 estrellas) = 1.2.
  const TOPE_AJUSTE = 1.2;
  const pct = Math.min(100, Math.round((Math.abs(diferencia) / TOPE_AJUSTE) * 100));

  return (
    <span
      className={`forma-indicator ${subiendo ? 'forma-indicator--up' : 'forma-indicator--down'} ${compact ? 'forma-indicator--compact' : ''}`}
      title={`Nivel efectivo ${nivelEfectivo.toFixed(2)} (manual ${nivelGeneral.toFixed(2)})`}
    >
      <span className="forma-indicator__icon">{subiendo ? '▲' : '▼'}</span>
      {!compact && (
        <span className="forma-indicator__bar">
          <span className="forma-indicator__bar-fill" style={{ width: `${pct}%` }}></span>
        </span>
      )}
      <span className="forma-indicator__label">{subiendo ? '+' : ''}{diferencia.toFixed(1)}</span>
    </span>
  );
};

export default FormaIndicator;
