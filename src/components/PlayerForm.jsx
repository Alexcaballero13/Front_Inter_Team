import React, { useState, useEffect } from 'react';

const PlayerForm = ({ player, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    posicion: 'PORTERO',
    nivelAtaque: 3,
    nivelDefensa: 3
  });

  useEffect(() => {
    if (player) {
      setFormData({
        nombre: player.nombre,
        posicion: player.posicion,
        nivelAtaque: player.nivelAtaque ?? 3,
        nivelDefensa: player.nivelDefensa ?? 3
      });
    }
  }, [player]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'nivelAtaque' || name === 'nivelDefensa') ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderStarInput = (field, label) => (
    <div className="input-group">
      <label>{label}</label>
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${formData[field] >= star ? 'active' : ''}`}
            onClick={() => handleChange({ target: { name: field, value: star } })}
          >
            ⭐
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="player-form fade-in">
      <div className="input-group">
        <label>NOMBRE</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder="Ej: Oliver Atom"
          required
        />
      </div>

      <div className="input-group">
        <label>POSICIÓN</label>
        <select name="posicion" value={formData.posicion} onChange={handleChange}>
          <option value="PORTERO">PORTERO</option>
          <option value="DEFENSA">DEFENSA</option>
          <option value="MEDIOCENTRO">MEDIOCENTRO</option>
          <option value="DELANTERO">DELANTERO</option>
        </select>
      </div>

      {renderStarInput('nivelAtaque', 'ATAQUE')}
      {renderStarInput('nivelDefensa', 'DEFENSA')}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>CANCELAR</button>
        <button type="submit" className="btn">{player ? 'ACTUALIZAR' : 'CREAR'}</button>
      </div>
    </form>
  );
};

export default PlayerForm;
