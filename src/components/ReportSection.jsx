import React, { useState } from 'react';
import { api } from '../services/api';
import './ReportSection.css';

// ─────────────────────────────────────────────
// Pestaña 1: Asistencia mensual (asistentes / ausentes)
// ─────────────────────────────────────────────
const AsistenciaTab = () => {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState([]);
  const [ausentes, setAusentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('asistentes'); // 'asistentes' | 'ausentes'
  const [searched, setSearched] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    setSearched(false);
    try {
      const [asistData, ausentesData] = await Promise.all([
        api.getReport(month, year),
        api.getAbsenteesReport(month, year),
      ]);
      setReport(asistData);
      setAusentes(ausentesData);
      setSearched(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-section fade-in">
      {/* Controles de mes/año */}
      <div className="report-controls">
        <div className="report-input">
          <label>MES</label>
          <input
            type="number"
            min="1"
            max="12"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="report-input">
          <label>AÑO</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary" onClick={fetchReport} disabled={loading}>
          {loading ? '...' : 'VER'}
        </button>
      </div>

      {/* Toggle Asistentes / Ausentes */}
      {searched && (
        <div className="mode-toggle">
          <button
            className={`toggle-btn ${mode === 'asistentes' ? 'active' : ''}`}
            onClick={() => setMode('asistentes')}
          >
            ✅ ASISTENTES
          </button>
          <button
            className={`toggle-btn toggle-btn--absent ${mode === 'ausentes' ? 'active active--absent' : ''}`}
            onClick={() => setMode('ausentes')}
          >
            ❌ AUSENTES
          </button>
        </div>
      )}

      {/* Resultados */}
      <div className="report-results">
        {!searched ? (
          <p className="no-data">SELECCIONA UN MES Y AÑO PARA VER EL REPORTE</p>
        ) : mode === 'asistentes' ? (
          report.length > 0 ? (
            <table className="report-table">
              <thead>
                <tr>
                  <th>NOMBRE</th>
                  <th className="count-header">PARTIDOS</th>
                </tr>
              </thead>
              <tbody>
                {report.map((item, i) => (
                  <tr key={i}>
                    <td>{item.nombre}</td>
                    <td className="count">{item.partidosJugados}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">SIN REGISTROS PARA ESTE PERIODO</p>
          )
        ) : (
          ausentes.length > 0 ? (
            <>
              <div className="absent-header">
                <span className="absent-count">{ausentes.length}</span>
                <span className="absent-label">JUGADOR{ausentes.length !== 1 ? 'ES' : ''} SIN ASISTENCIA EN EL MES</span>
              </div>
              <ul className="absent-list">
                {ausentes.map((nombre, i) => (
                  <li key={i} className="absent-item">
                    <span className="absent-icon">⚠</span>
                    <span className="absent-name">{nombre}</span>
                    <span className="absent-badge">0 partidos</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="no-data no-data--success">🎉 TODOS LOS JUGADORES ASISTIERON ESTE MES</p>
          )
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Pestaña 2: Histórico de Partidos
// ─────────────────────────────────────────────
const HistorialTab = ({ userRole }) => {
  const [matchDays, setMatchDays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [marcadorForm, setMarcadorForm] = useState({});
  const [guardandoMarcador, setGuardandoMarcador] = useState(null);
  const [editandoRosterId, setEditandoRosterId] = useState(null);
  const [rosterEdicion, setRosterEdicion] = useState([]);
  const [todosLosJugadores, setTodosLosJugadores] = useState([]);
  const [jugadoresCargados, setJugadoresCargados] = useState(false);
  const [agregarSeleccion, setAgregarSeleccion] = useState({});
  const [guardandoRoster, setGuardandoRoster] = useState(false);

  const iniciarEdicionRoster = async (match) => {
    setEditandoRosterId(match.id);
    setRosterEdicion((match.jugadores || []).map(j => ({ ...j })));
    setAgregarSeleccion({});
    if (!jugadoresCargados) {
      try {
        const data = await api.getPlayers();
        setTodosLosJugadores(data);
        setJugadoresCargados(true);
      } catch (err) {
        console.error(err);
        alert('No se pudo cargar la lista de jugadores para agregar.');
      }
    }
  };

  const cancelarEdicionRoster = () => {
    setEditandoRosterId(null);
    setRosterEdicion([]);
    setAgregarSeleccion({});
  };

  // Se identifica por (nombre, equipo), no solo por nombre: si el mismo
  // nombre apareciera en los dos equipos, quitar uno no debe afectar al otro.
  const quitarDeRoster = (nombre, equipo) => {
    setRosterEdicion(prev => prev.filter(j => !(j.nombre === nombre && j.equipo === equipo)));
  };

  const agregarARoster = (equipo) => {
    const nombre = agregarSeleccion[equipo];
    if (!nombre) return;
    setRosterEdicion(prev => [...prev, { nombre, equipo }]);
    setAgregarSeleccion(prev => ({ ...prev, [equipo]: '' }));
  };

  const guardarRoster = async (id) => {
    const enLocal = rosterEdicion.filter(j => j.equipo === 'LOCAL').length;
    const enVisitante = rosterEdicion.filter(j => j.equipo === 'VISITANTE').length;
    if (enLocal === 0 || enVisitante === 0) {
      alert('Cada equipo necesita al menos un jugador.');
      return;
    }
    setGuardandoRoster(true);
    try {
      const actualizado = await api.actualizarJugadoresMatchDay(id, rosterEdicion);
      setMatchDays(prev => prev.map(m => m.id === id ? actualizado : m));
      setEditandoRosterId(null);
      setRosterEdicion([]);
      setAgregarSeleccion({});
    } catch (err) {
      console.error(err);
      alert('Error al guardar los jugadores del partido.');
    } finally {
      setGuardandoRoster(false);
    }
  };

  const handleMarcadorChange = (id, campo, valor) => {
    setMarcadorForm(prev => ({
      ...prev,
      [id]: { ...prev[id], [campo]: valor }
    }));
  };

  const handleGuardarMarcador = async (id) => {
    const datos = marcadorForm[id];
    if (!datos || datos.golesLocal === undefined || datos.golesVisitante === undefined || datos.golesLocal === '' || datos.golesVisitante === '') {
      alert('Ingresa ambos marcadores.');
      return;
    }
    if (Number(datos.golesLocal) < 0 || Number(datos.golesVisitante) < 0) {
      alert('Los goles no pueden ser negativos.');
      return;
    }
    setGuardandoMarcador(id);
    try {
      const actualizado = await api.registrarMarcador(id, Number(datos.golesLocal), Number(datos.golesVisitante));
      setMatchDays(prev => prev.map(m => m.id === id ? actualizado : m));
    } catch (err) {
      console.error(err);
      alert('Error al guardar el marcador.');
    } finally {
      setGuardandoMarcador(null);
    }
  };

  const fetchMatchDays = async () => {
    setLoading(true);
    try {
      const data = await api.getMatchDays();
      // Ordenar de más reciente a más antiguo
      const sorted = [...data].sort((a, b) => new Date(b.fechaPartido) - new Date(a.fechaPartido));
      setMatchDays(sorted);
      setLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, fecha) => {
    const fechaFormateada = formatDate(fecha);
    if (!window.confirm(`¿Seguro que deseas eliminar el partido del ${fechaFormateada}? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      await api.deleteMatchDay(id);
      setMatchDays(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el partido.');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (fechaStr) => {
    const d = new Date(fechaStr);
    return d.toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (fechaStr) => {
    const d = new Date(fechaStr);
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="historial-section fade-in">
      {!loaded ? (
        <div className="historial-load-wrapper">
          <button className="btn btn-secondary" onClick={fetchMatchDays} disabled={loading}>
            {loading ? 'CARGANDO...' : '📋 CARGAR HISTORIAL DE PARTIDOS'}
          </button>
        </div>
      ) : matchDays.length === 0 ? (
        <p className="no-data">SIN PARTIDOS REGISTRADOS</p>
      ) : (
        <div className="historial-list">
          <div className="historial-count">
            <span className="historial-num">{matchDays.length}</span>
            <span className="historial-label">PARTIDOS REGISTRADOS</span>
          </div>
          {matchDays.map((match) => {
            const tieneMarcador = match.golesLocal != null && match.golesVisitante != null;
            const jugadoresLocal = match.jugadores?.filter(j => j.equipo === 'LOCAL') || [];
            const jugadoresVisitante = match.jugadores?.filter(j => j.equipo === 'VISITANTE') || [];

            return (
              <div key={match.id} className="historial-card">
                <div
                  className="historial-card-header"
                  onClick={() => {
                    const nuevoExpandedId = expandedId === match.id ? null : match.id;
                    // Si se colapsa o se cambia de partido mientras se estaba editando el
                    // roster, se descarta el borrador en vez de dejarlo "a medias" oculto.
                    if (editandoRosterId !== null && editandoRosterId !== nuevoExpandedId) {
                      cancelarEdicionRoster();
                    }
                    setExpandedId(nuevoExpandedId);
                  }}
                >
                  <div className="historial-date-block">
                    <span className="historial-date">{formatDate(match.fechaPartido)}</span>
                    <span className="historial-time">{formatTime(match.fechaPartido)}</span>
                  </div>
                  <div className="historial-meta">
                    {tieneMarcador ? (
                      <span className="historial-marcador-chip">{match.golesLocal} - {match.golesVisitante}</span>
                    ) : (
                      <span className="historial-marcador-chip historial-marcador-chip--pendiente">⚠ SIN MARCADOR</span>
                    )}
                    <span className="historial-players-count">{match.jugadores?.length || 0} jugadores</span>
                    <span className="historial-chevron">{expandedId === match.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {expandedId === match.id && (
                  <div className="historial-card-body">
                    {tieneMarcador ? (
                      <div className="historial-marcador-final">
                        <span className="historial-marcador-equipo">LOCAL {match.golesLocal}</span>
                        <span className="historial-marcador-vs">—</span>
                        <span className="historial-marcador-equipo">{match.golesVisitante} VISITANTE</span>
                      </div>
                    ) : userRole === 'ADMIN' ? (
                      <div className="historial-marcador-form">
                        <div className="report-input">
                          <label>GOLES LOCAL</label>
                          <input
                            type="number"
                            min="0"
                            value={marcadorForm[match.id]?.golesLocal ?? ''}
                            onChange={(e) => handleMarcadorChange(match.id, 'golesLocal', e.target.value)}
                          />
                        </div>
                        <div className="report-input">
                          <label>GOLES VISITANTE</label>
                          <input
                            type="number"
                            min="0"
                            value={marcadorForm[match.id]?.golesVisitante ?? ''}
                            onChange={(e) => handleMarcadorChange(match.id, 'golesVisitante', e.target.value)}
                          />
                        </div>
                        <button
                          className="btn btn-secondary historial-marcador-guardar"
                          onClick={() => handleGuardarMarcador(match.id)}
                          disabled={guardandoMarcador === match.id}
                        >
                          {guardandoMarcador === match.id ? '...' : 'GUARDAR'}
                        </button>
                      </div>
                    ) : (
                      <p className="no-data">SIN MARCADOR REGISTRADO TODAVÍA</p>
                    )}

                    {editandoRosterId === match.id ? (
                      <div className="historial-roster-editor">
                        {['LOCAL', 'VISITANTE'].map((equipo) => {
                          const enEsteEquipo = rosterEdicion.filter(j => j.equipo === equipo);
                          const nombresEnPartido = rosterEdicion.map(j => j.nombre);
                          const disponibles = todosLosJugadores
                            .filter(j => !nombresEnPartido.includes(j.nombre))
                            .sort((a, b) => a.nombre.localeCompare(b.nombre));
                          return (
                            <div key={equipo} className="historial-roster-col">
                              <h4 className="historial-equipo-titulo">{equipo}</h4>
                              <div className="historial-players-grid historial-roster-grid">
                                {enEsteEquipo.length === 0 ? (
                                  <span className="historial-roster-vacio">Sin jugadores</span>
                                ) : (
                                  enEsteEquipo.map((j) => (
                                    <span key={`${j.equipo}-${j.nombre}`} className="historial-player-chip historial-player-chip--editable">
                                      {j.nombre}
                                      <button
                                        type="button"
                                        className="historial-player-chip-quitar"
                                        onClick={() => quitarDeRoster(j.nombre, j.equipo)}
                                        aria-label={`Quitar a ${j.nombre}`}
                                      >
                                        ×
                                      </button>
                                    </span>
                                  ))
                                )}
                              </div>
                              <div className="historial-roster-agregar">
                                <select
                                  value={agregarSeleccion[equipo] || ''}
                                  onChange={(e) => setAgregarSeleccion(prev => ({ ...prev, [equipo]: e.target.value }))}
                                  aria-label={`Agregar jugador a ${equipo}`}
                                >
                                  <option value="">+ Agregar jugador...</option>
                                  {disponibles.map((j) => (
                                    <option key={j.id} value={j.nombre}>{j.nombre}</option>
                                  ))}
                                </select>
                                <button
                                  type="button"
                                  className="btn btn-secondary historial-roster-agregar-btn"
                                  onClick={() => agregarARoster(equipo)}
                                  disabled={!agregarSeleccion[equipo]}
                                >
                                  AGREGAR
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="historial-equipos">
                        <div className="historial-equipo-col">
                          <h4 className="historial-equipo-titulo">LOCAL</h4>
                          <div className="historial-players-grid">
                            {jugadoresLocal.map((j, idx) => (
                              <span key={idx} className="historial-player-chip">{j.nombre}</span>
                            ))}
                          </div>
                        </div>
                        <div className="historial-equipo-col">
                          <h4 className="historial-equipo-titulo">VISITANTE</h4>
                          <div className="historial-players-grid">
                            {jugadoresVisitante.map((j, idx) => (
                              <span key={idx} className="historial-player-chip">{j.nombre}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {userRole === 'ADMIN' && (
                      editandoRosterId === match.id ? (
                        <div className="historial-roster-acciones">
                          <button type="button" className="btn btn-secondary" onClick={cancelarEdicionRoster}>
                            CANCELAR
                          </button>
                          <button type="button" className="btn" onClick={() => guardarRoster(match.id)} disabled={guardandoRoster}>
                            {guardandoRoster ? 'GUARDANDO...' : 'GUARDAR JUGADORES'}
                          </button>
                        </div>
                      ) : (
                        <>
                          <button type="button" className="btn-editar-roster" onClick={() => iniciarEdicionRoster(match)}>
                            ✏️ AGREGAR/QUITAR JUGADORES
                          </button>
                          <button
                            className="btn-delete-match"
                            onClick={() => handleDelete(match.id, match.fechaPartido)}
                            disabled={deleting === match.id}
                          >
                            {deleting === match.id ? 'ELIMINANDO...' : '🗑 ELIMINAR ESTE PARTIDO'}
                          </button>
                        </>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Texto de ayuda por columna, para el "?" clickeable del header.
const AYUDA_COLUMNAS = {
  manual: { titulo: 'MANUAL', texto: 'Nivel que el admin puso a mano en Gestión de Jugadores (promedio de Ataque y Defensa, 1 a 5).' },
  efectivo: { titulo: 'EFECTIVO', texto: 'El nivel manual, ajustado automáticamente según cómo le fue al jugador en partidos reales con marcador. Es el que usa el sorteo para armar los equipos, no el manual. Verde = rinde por encima de su nivel manual, rojo = por debajo.' },
  pj: { titulo: 'PJ', texto: 'Partidos con marcador registrado en los que participó.' },
  ved: { titulo: 'V-E-D', texto: 'Victorias, empates y derrotas en esos partidos.' },
  pct: { titulo: '%V', texto: 'Porcentaje de esos partidos que ganó (Victorias ÷ Partidos Jugados).' },
};

const AyudaColumna = ({ columnKey, onToggle }) => (
  <button
    type="button"
    className="rendimiento-ayuda-btn"
    onClick={(e) => { e.stopPropagation(); onToggle(columnKey); }}
    aria-label={`Qué significa ${AYUDA_COLUMNAS[columnKey].titulo}`}
  >
    ?
  </button>
);

// ─────────────────────────────────────────────
// Pestaña 3: Rendimiento (nivel manual vs. nivelEfectivo + win-rate)
// Pensada para consultar y debatir si la calificación manual de cada
// jugador sigue reflejando cómo le va realmente en los partidos.
// ─────────────────────────────────────────────
const RendimientoTab = () => {
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [ayudaAbierta, setAyudaAbierta] = useState(null);

  const toggleAyuda = (key) => setAyudaAbierta(prev => (prev === key ? null : key));

  const fetchJugadores = async () => {
    setLoading(true);
    try {
      const data = await api.getPlayers();
      // De mejor a peor nivel efectivo (el que realmente usa el sorteo). Los
      // jugadores sin calificar (nivelEfectivo null) quedan al final.
      const ordenados = [...data].sort((a, b) => {
        const efA = a.nivelEfectivo ?? -Infinity;
        const efB = b.nivelEfectivo ?? -Infinity;
        return efB - efA;
      });
      setJugadores(ordenados);
      setLoaded(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rendimiento-section fade-in" onClick={() => setAyudaAbierta(null)}>
      {!loaded ? (
        <div className="historial-load-wrapper">
          <button className="btn btn-secondary" onClick={fetchJugadores} disabled={loading}>
            {loading ? 'CARGANDO...' : '📈 CARGAR RENDIMIENTO'}
          </button>
        </div>
      ) : jugadores.length === 0 ? (
        <p className="no-data">NO HAY JUGADORES REGISTRADOS</p>
      ) : (
        <>
          <div className="rendimiento-legend">
            <span className="rendimiento-legend-item">MANUAL <AyudaColumna columnKey="manual" onToggle={toggleAyuda} /></span>
            <span className="rendimiento-legend-item">EFECTIVO <AyudaColumna columnKey="efectivo" onToggle={toggleAyuda} /></span>
            <span className="rendimiento-legend-item">PJ <AyudaColumna columnKey="pj" onToggle={toggleAyuda} /></span>
            <span className="rendimiento-legend-item">V-E-D <AyudaColumna columnKey="ved" onToggle={toggleAyuda} /></span>
            <span className="rendimiento-legend-item">%V <AyudaColumna columnKey="pct" onToggle={toggleAyuda} /></span>
          </div>

          {ayudaAbierta && (
            <div className="rendimiento-ayuda-banner" onClick={(e) => e.stopPropagation()}>
              <strong>{AYUDA_COLUMNAS[ayudaAbierta].titulo}</strong>
              <span>{AYUDA_COLUMNAS[ayudaAbierta].texto}</span>
              <button type="button" className="rendimiento-ayuda-cerrar" onClick={() => setAyudaAbierta(null)}>×</button>
            </div>
          )}

          <div className="rendimiento-list">
            {jugadores.map((j) => {
              const sinHistorial = !j.partidosJugados;
              const winRate = sinHistorial ? null : Math.round((j.victorias / j.partidosJugados) * 100);
              const delta = j.nivelEfectivo != null && j.nivelGeneral != null ? j.nivelEfectivo - j.nivelGeneral : 0;
              const claseEfectivo = delta > 0.05 ? 'rendimiento-chip-valor--up' : delta < -0.05 ? 'rendimiento-chip-valor--down' : '';
              return (
                <div key={j.id} className="rendimiento-card">
                  <div className="rendimiento-card-nombre">{j.nombre}</div>
                  <div className="rendimiento-card-stats">
                    <span className="rendimiento-chip">
                      <span className="rendimiento-chip-label">MAN</span>
                      <span className="rendimiento-chip-valor">{j.nivelGeneral != null ? j.nivelGeneral.toFixed(1) : '—'}</span>
                    </span>
                    <span className="rendimiento-chip">
                      <span className="rendimiento-chip-label">EFEC</span>
                      <span className={`rendimiento-chip-valor ${claseEfectivo}`}>
                        {j.nivelEfectivo != null ? j.nivelEfectivo.toFixed(2) : '—'}
                      </span>
                    </span>
                    <span className="rendimiento-chip">
                      <span className="rendimiento-chip-label">PJ</span>
                      <span className="rendimiento-chip-valor">{j.partidosJugados || 0}</span>
                    </span>
                    <span className="rendimiento-chip">
                      <span className="rendimiento-chip-label">V-E-D</span>
                      <span className="rendimiento-chip-valor">{j.victorias || 0}-{j.empates || 0}-{j.derrotas || 0}</span>
                    </span>
                    <span className="rendimiento-chip">
                      <span className="rendimiento-chip-label">%V</span>
                      <span className="rendimiento-chip-valor">{winRate != null ? `${winRate}%` : '—'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Componente principal con tabs
// ─────────────────────────────────────────────
const ReportSection = ({ userRole }) => {
  const [activeTab, setActiveTab] = useState('asistencia');

  return (
    <div className="reports-container">
      {/* Tabs de navegación */}
      <div className="report-tabs">
        <button
          className={`report-tab ${activeTab === 'asistencia' ? 'report-tab--active' : ''}`}
          onClick={() => setActiveTab('asistencia')}
        >
          📊 ASISTENCIA
        </button>
        <button
          className={`report-tab ${activeTab === 'historial' ? 'report-tab--active' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          📋 HISTORIAL
        </button>
        <button
          className={`report-tab ${activeTab === 'rendimiento' ? 'report-tab--active' : ''}`}
          onClick={() => setActiveTab('rendimiento')}
        >
          📈 RENDIMIENTO
        </button>
      </div>

      {/* Contenido de la tab activa */}
      {activeTab === 'asistencia' ? (
        <AsistenciaTab />
      ) : activeTab === 'historial' ? (
        <HistorialTab userRole={userRole} />
      ) : (
        <RendimientoTab />
      )}
    </div>
  );
};

export default ReportSection;
