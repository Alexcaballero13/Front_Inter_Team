import React, { useState } from 'react';
import { api } from '../services/api';
import './LoginPage.css';

const LoginPage = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.login(username, password);
      if (result.ok) {
        onLoginSuccess(result.role);
      } else {
        setError('CREDENCIALES INVÁLIDAS');
      }
    } catch (err) {
      setError('ERROR DE CONEXIÓN AL BACKEND');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="login-box">
        <header className="login-header">
          <span className="title-sub">ACCESO AL SISTEMA</span>
          <h1 className="title-main">LOGIN</h1>
        </header>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>USUARIO</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nombre de usuario"
              required
            />
          </div>

          <div className="input-group">
            <label>CONTRASEÑA</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'AUTENTICANDO...' : 'ENTRAR 🔓'}
          </button>
        </form>
      </div>

      <div className="jamaica-stripes-mini">
        <div className="stripe green"></div>
        <div className="stripe yellow"></div>
        <div className="stripe red"></div>
      </div>
    </div>
  );
};

export default LoginPage;
