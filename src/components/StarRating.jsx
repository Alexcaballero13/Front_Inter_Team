import React from 'react';
import './StarRating.css';

// Ícono de estrella (Material Design "star"), 24x24.
const STAR_PATH = 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z';

// Una estrella individual: dibuja el contorno vacío y, encima, una copia
// rellena recortada al porcentaje que corresponde (0% a 100%) — así se logra
// el efecto "media estrella" / "estrella al 25%" típico de las cartas FIFA.
const Star = ({ fill }) => {
  const pct = Math.round(Math.max(0, Math.min(1, fill)) * 100);
  return (
    <span className="star-rating__star">
      <svg viewBox="0 0 24 24" className="star-rating__star-bg" aria-hidden="true">
        <path d={STAR_PATH} />
      </svg>
      <span className="star-rating__star-fill-clip" style={{ width: `${pct}%` }}>
        <svg viewBox="0 0 24 24" className="star-rating__star-fg" aria-hidden="true">
          <path d={STAR_PATH} />
        </svg>
      </span>
    </span>
  );
};

/**
 * Muestra un nivel general (posiblemente decimal, ej. 3.5 o 4.25) como
 * estrellas con relleno parcial, estilo FIFA. Si value es null/undefined
 * (jugador sin calificar todavía), muestra un aviso en vez de estrellas.
 */
const StarRating = ({ value, max = 5, size = 16, className = '' }) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className={`star-rating star-rating--empty ${className}`}>SIN CALIFICAR</span>;
  }

  const clamped = Math.max(0, Math.min(max, value));
  const stars = Array.from({ length: max }, (_, i) => clamped - i);

  return (
    <span
      className={`star-rating ${className}`}
      style={{ '--star-size': `${size}px` }}
      aria-label={`${clamped.toFixed(2)} de ${max} estrellas`}
      title={`${clamped.toFixed(2)} / ${max}`}
    >
      {stars.map((fill, i) => <Star key={i} fill={fill} />)}
    </span>
  );
};

export default StarRating;
