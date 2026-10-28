import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onEnter }) => {
  const handleEnter = (e) => {
    e.preventDefault();
    onEnter('INTER TEAM'); // Defaulting the group name since there is no input anymore
  };

  return (
    <div className="landing-container fade-in">
      <div className="landing-content">
        <div className="logo-container">
          <img
            src="/LOGO_INTER.svg"
            alt="Logo Inter Team"
            className="team-logo"
          />
        </div>

        <h1 className="landing-title">INTER<br/><span className="title-highlight">TEAM</span></h1>
        <p className="landing-subtitle">EL DRAFT DEFINITIVO</p>

        <form onSubmit={handleEnter} className="landing-form">
          <button type="submit" className="btn btn-enter">
            ENTRAR
          </button>
        </form>
      </div>
      
      <div className="jamaica-stripes">
        <div className="stripe green"></div>
        <div className="stripe yellow"></div>
        <div className="stripe red"></div>
      </div>
    </div>
  );
};

export default LandingPage;
