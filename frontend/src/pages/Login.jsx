import React, { useState } from 'react';
import API from '../services/api';

const Login = ({ setCurrentView, setIsConnected, setEmailForActivation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [emailForgot, setEmailForgot] = useState('');

  const [errorMsg, setErrorMsg] = useState(''); 
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); 
    setSuccessMsg('');

    try {
      const response = await API.post('/r_utilisateur/connexion', {
        identifiant: username.trim(),
        motDePasse: password
      });

      if (response.data && response.data.token) {
        if (rememberMe) {
          localStorage.setItem('token', response.data.token);
        } else {
          sessionStorage.setItem('token', response.data.token);
        }
        setIsConnected(true);
        setCurrentView('home'); 
      }
    } catch (error) {
      if (error.response && error.response.status === 403 && error.response.data.statut === "INACTIF") {
        setEmailForActivation(error.response.data.email);
        setCurrentView('register');
      } else {
        console.error("Erreur de connexion au serveur :", error);
        const serverMessage = error.response?.data?.error || "Impossible de contacter le serveur Heracles.";
        setErrorMsg(serverMessage);
      }
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const response = await API.post('/r_utilisateur/mot-de-passe-oublie', {
        email: emailForgot.trim().toLowerCase()
      });
      setSuccessMsg(response.data.message);
      setEmailForgot('');
    } catch (error) {
      const serverMessage = error.response?.data?.error || "Erreur lors du traitement de la demande.";
      setErrorMsg(serverMessage);
    }
  };

  return (
    <div className="auth-card">
      
      <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent-blue)', margin: '0 0 0.4rem 0', letterSpacing: '0.5px' }}>
        HERACLES
      </h2>
      <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: '600', margin: '0 0 2.2rem 0' }}>
        {!isForgotPasswordMode ? "Connexion" : "Mot de passe oublié"}
      </p>

      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', padding: '0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.2rem', textAlign: 'left' }}>
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.2rem', textAlign: 'left' }}>
          {successMsg}
        </div>
      )}

      {!isForgotPasswordMode ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          <div className="form-group">
            <label className="form-label">Nom d'utilisateur ou Email</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
                style={{ paddingRight: '3.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password-btn"
              >
                {showPassword ? 'Masquer' : 'Afficher'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'left', marginTop: '0.2rem' }}>
            <input 
              type="checkbox" 
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="rememberMe" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', userSelect: 'none' }}>
              Rester connecté
            </label>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Connexion
          </button>
        </form>
      ) : (
        <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          <div className="form-group">
            <label className="form-label">Adresse Email associée au compte</label>
            <input 
              type="email" 
              value={emailForgot}
              onChange={(e) => setEmailForgot(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Réinitialiser le mot de passe
          </button>

          <button 
            type="button" 
            onClick={() => { setIsForgotPasswordMode(false); setErrorMsg(''); setSuccessMsg(''); }}
            className="btn-secondary"
            style={{ width: '100%', padding: '0.75rem', marginTop: '0' }}
          >
            Retour
          </button>
        </form>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', fontSize: '0.85rem', fontWeight: '600' }}>
        <button className="nav-hover-btn" style={{ padding: 0, fontSize: '0.85rem' }} onClick={() => setCurrentView('register')}>
          Créer un compte
        </button>
        {!isForgotPasswordMode && (
          <button className="nav-hover-btn" style={{ padding: 0, fontSize: '0.85rem' }} onClick={() => { setIsForgotPasswordMode(true); setErrorMsg(''); setSuccessMsg(''); }}>
            Mot de passe oublié ?
          </button>
        )}
      </div>

    </div>
  );
};

export default Login;