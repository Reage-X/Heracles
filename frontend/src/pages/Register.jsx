import React, { useState } from 'react';
import API from '../services/api';

const Register = ({ setCurrentView, emailForActivation, setEmailForActivation }) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');

  const [code, setCode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setError(''); setSuccess('');
      const response = await API.post('/r_utilisateur/inscription', { nom, prenom, pseudo, email, motDePasse });
      
      setSuccess(response.data.message || 'Un code vous a été envoyé.');
      
      setTimeout(() => {
        setEmailForActivation(email.toLowerCase().trim());
        setError('');
        setSuccess('');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const handleActivation = async (e) => {
    e.preventDefault();
    try {
      setLoading(true); setError(''); setSuccess('');
      const response = await API.post('/r_utilisateur/activation', { email: emailForActivation, code });
      
      setSuccess(response.data.message || 'Compte activé !');
      
      setTimeout(() => {
        setEmailForActivation(''); 
        setCurrentView('login');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.error || "Code invalide.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setError(''); setSuccess('');
      const response = await API.post('/r_utilisateur/renvoyer-code', { email: emailForActivation });
      setSuccess(response.data.message);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur d'envoi.");
    }
  };
  
  if (emailForActivation) {
    return (
      <div className="auth-card">
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.6rem', color: 'var(--text-main)' }}>Validation</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
          Un code à 6 chiffres a été envoyé à <strong>{emailForActivation}</strong>. Il est valide pendant 10 minutes.
        </p>

        {error && <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', padding: '0.7rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
        {success && <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '0.7rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 'bold' }}>{success}</div>}

        <form onSubmit={handleActivation}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>CODE D'ACTIVATION</label>
            <input type="text" maxLength="6" value={code} onChange={(e) => setCode(e.target.value)} className="form-input" required placeholder="Ex: 123456" style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            Activer mon compte
          </button>

          <button type="button" onClick={handleResendCode} className="btn-secondary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
            Renvoyer le code
          </button>
        </form>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem', marginBottom: 0 }}>
          <span onClick={() => { setEmailForActivation(''); setError(''); setSuccess(''); }} style={{ color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>
            Annuler et créer un autre compte
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.6rem', color: 'var(--text-main)' }}>Inscription</h2>
      
      {error && <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', padding: '0.7rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 'bold' }}>{error}</div>}
      {success && <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '0.7rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 'bold' }}>{success}</div>}

      <form onSubmit={handleRegister}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>NOM</label>
            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} className="form-input" required placeholder="Doe" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>PRÉNOM</label>
            <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} className="form-input" required placeholder="John" />
          </div>
        </div>

        <div className="form-group">
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>PSEUDO</label>
          <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="form-input" required placeholder="johndoe34" />
        </div>

        <div className="form-group">
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>ADRESSE EMAIL</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" required placeholder="john.doe@exemple.com" />
        </div>

        <div className="form-group">
          <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>MOT DE PASSE</label>
          <input type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} className="form-input" required placeholder="••••••••" />
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}>
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1.5rem', marginBottom: 0 }}>
        Déjà inscrit ?{' '}
        <span onClick={() => setCurrentView('login')} style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: '600' }}>
          Se connecter
        </span>
      </p>
    </div>
  );
};

export default Register;