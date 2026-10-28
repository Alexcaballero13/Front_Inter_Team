import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import './MatchSummary.css';

const MatchSummary = ({ teamA, teamB, onBackToMenu }) => {
  const cardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: window.devicePixelRatio || 2, // Ajuste dinámico para evitar colapsar memoria en Android
        useCORS: true,
        backgroundColor: '#141518', // --color-surface
        logging: false,
      });

      // Generar nombre con la fecha actual
      const fecha = new Date().toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).replace(/\//g, '-');
      const nombreArchivo = `inter-matchday-${fecha}.png`;

      // Usar toBlob en lugar de toDataURL para compatibilidad total con Android/Chrome
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Fallo al generar el Blob de la imagen'));
        }, 'image/png');
      });

      // En Android, el truco clásico de <a download> con una URL blob: no es
      // confiable (según el navegador/WebView, a veces no pasa nada o abre la
      // imagen sin dar opción real de guardarla). La forma que sí funciona en
      // Android (y también en iOS) es entregarle el archivo al share sheet
      // nativo del celular, que trae la opción de "Guardar imagen"/"Guardar
      // en Fotos". Si el navegador no soporta compartir archivos (la mayoría
      // de navegadores de escritorio), caemos al método clásico de descarga.
      const file = new File([blob], nombreArchivo, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'INTER TEAM - MatchDay',
          });
          return;
        } catch (shareErr) {
          if (shareErr?.name === 'AbortError') {
            // El usuario cerró el share sheet sin elegir nada: no es un error real.
            return;
          }
          // Si compartir falla por otra razón, seguimos con la descarga clásica.
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = nombreArchivo;
      link.href = url;
      document.body.appendChild(link); // Necesario para algunos navegadores móviles
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Liberar memoria RAM
    } catch (err) {
      console.error('Error al generar imagen:', err);
      alert('No se pudo generar la imagen. Intentá de nuevo.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="summary-page fade-in">
      {/* Tarjeta exportable — se captura con html2canvas */}
      <div className="summary-card" ref={cardRef}>
        <header className="summary-header">
          <div className="header-logo">
            <img src="/LOGO_INTER.png" alt="Logo" className="mini-logo" crossOrigin="anonymous" />
          </div>
          <div className="header-text">
            <span className="summary-subtitle">RESUMEN DEL SORTEO</span>
            <h1 className="summary-title">MATCHDAY</h1>
          </div>
        </header>

        <div className="summary-body">
          <div className="summary-team local">
            <h2 className="summary-team-name">LOCAL</h2>
            <div className="summary-list">
              {teamA.map((p) => (
                <div key={p.id} className="summary-item">
                  <span className="summary-pos">{p.posicion.substring(0, 3)}</span>
                  <span className="summary-player">{p.nombre}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="summary-vs">
            <div className="vs-line"></div>
            <div className="vs-text">VS</div>
            <div className="vs-line"></div>
          </div>

          <div className="summary-team away">
            <h2 className="summary-team-name">VISITANTE</h2>
            <div className="summary-list">
              {teamB.map((p) => (
                <div key={p.id} className="summary-item">
                  <span className="summary-pos">{p.posicion.substring(0, 3)}</span>
                  <span className="summary-player">{p.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="summary-footer">
          <div className="jamaica-stripes-mini">
            <div className="stripe green"></div>
            <div className="stripe yellow"></div>
            <div className="stripe red"></div>
          </div>
        </footer>
      </div>

      {/* Acciones — fuera de la tarjeta, no se capturan */}
      <div className="summary-actions no-print">
        <button
          className="btn-download-match"
          onClick={handleDownloadImage}
          disabled={downloading}
        >
          {downloading ? '⏳ GENERANDO...' : '📸 DESCARGAR IMAGEN DEL PARTIDO'}
        </button>
        <button className="btn btn-menu" onClick={onBackToMenu}>
          VOLVER AL MENÚ PRINCIPAL
        </button>
      </div>
    </div>
  );
};

export default MatchSummary;
