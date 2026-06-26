import React, { useState, useEffect } from 'react';
import API from '../services/api';

const Profile = () => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [pseudo, setPseudo] = useState('');
  const [emailActuel, setEmailActuel] = useState('');

  const [activeEditSection, setActiveEditSection] = useState(null); 

  const [editNom, setEditNom] = useState('');
  const [editPrenom, setEditPrenom] = useState('');
  const [editPseudo, setEditPseudo] = useState('');
  const [ancienMdp, setAncienMdp] = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [showAncienMdp, setShowAncienMdp] = useState(false);
  const [showNouveauMdp, setShowNouveauMdp] = useState(false);

  const [nouvelEmail, setNouvelEmail] = useState('');
  const [stepEmail, setStepEmail] = useState(1);
  const [codeAncienEmail, setCodeAncienEmail] = useState('');
  const [codeNouveauEmail, setCodeNouveauEmail] = useState('');

  const [activeTab, setActiveTab] = useState('info'); 
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    chargerDonneesProfil();
  }, []);

  const chargerDonneesProfil = async () => {
    try {
      const response = await API.get('/r_utilisateur/profil');
      setNom(response.data.nom);
      setPrenom(response.data.prenom);
      setPseudo(response.data.pseudo);
      setEmailActuel(response.data.email);
      
      setEditNom(response.data.nom);
      setEditPrenom(response.data.prenom);
      setEditPseudo(response.data.pseudo);
    } catch (error) {
      setErrorMsg("Erreur lors de la récupération des données de profil.");
    }
  };

  const handleGeneralSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    try {
      const response = await API.put('/r_utilisateur/modifier', { nom: editNom, prenom: editPrenom, pseudo: editPseudo });
      setNom(editNom); setPrenom(editPrenom); setPseudo(editPseudo);
      setSuccessMsg(response.data.message);
      setActiveEditSection(null);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de la modification.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    try {
      const response = await API.put('/r_utilisateur/modifier-mdp', {
        ancienMotDePasse: ancienMdp,
        nouveauMotDePasse: nouveauMdp
      });
      setSuccessMsg(response.data.message);
      setAncienMdp(''); setNouveauMdp('');
      setActiveEditSection(null);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Erreur de mot de passe.");
    }
  };

  const handleEmailRequestSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    try {
      const response = await API.post('/r_utilisateur/demande-email', { nouvelEmail: nouvelEmail });
      setSuccessMsg(response.data.message);
      setStepEmail(2);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Erreur demande email.");
    }
  };

  const handleEmailConfirmSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    try {
      const response = await API.post('/r_utilisateur/confirmer-email', {
        codeActuel: codeAncienEmail,
        codeNouveau: codeNouveauEmail
      });
      setSuccessMsg(response.data.message);
      setEmailActuel(response.data.email);
      setNouvelEmail(''); setCodeAncienEmail(''); setCodeNouveauEmail('');
      setStepEmail(1);
      setActiveEditSection(null);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Codes invalides.");
    }
  };

  const handleDeleteAccount = async () => {
    setErrorMsg(''); setSuccessMsg('');
    try {
      const response = await API.delete('/r_utilisateur/supprimer');
      setSuccessMsg(response.data.message);
      setTimeout(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.reload();
      }, 1500);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de la suppression du compte.");
    }
  };

  const cancelEdition = () => {
    setActiveEditSection(null);
    setErrorMsg(''); setSuccessMsg('');
    setEditNom(nom); setEditPrenom(prenom); setEditPseudo(pseudo);
    setAncienMdp(''); setNouveauMdp(''); setStepEmail(1);
  };

  return (
    <div className="sidebar-page-wrapper">
      
      <aside className={`sidebar-aside ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="sidebar-collapse-btn">
          {isCollapsed ? '›' : '‹'}
        </button>

        <button onClick={() => { setActiveTab('info'); cancelEdition(); }} className={`sidebar-nav-btn ${activeTab === 'info' ? 'active' : ''}`} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>👤</span>
          {!isCollapsed && <span style={{ marginLeft: '1rem', fontSize: '0.95rem' }}>Information personnelle</span>}
        </button>

        <button onClick={() => { setActiveTab('securite'); cancelEdition(); }} className={`sidebar-nav-btn ${activeTab === 'securite' ? 'active' : ''}`} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🔒</span>
          {!isCollapsed && <span style={{ marginLeft: '1rem', fontSize: '0.95rem' }}>Sécurité</span>}
        </button>
      </aside>

      <section style={{ flex: 1, padding: '4rem 2rem 2rem 2rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {errorMsg && <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', textAlign: 'left' }}>{errorMsg}</div>}
          {successMsg && <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', textAlign: 'left' }}>{successMsg}</div>}

          <div style={{ textAlign: 'left', marginBottom: '0.5rem' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
              {activeTab === 'info' ? "Informations personnelles" : "Paramètres de sécurité"}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
              {activeTab === 'info' ? "Informations d'identité utilisées sur la plateforme Heracles." : "Options de chiffrement de mot de passe et d'administration critique de votre accès."}
            </p>
          </div>

          <div className="settings-card">
            
            {activeTab === 'info' && (
              <>
                <div 
                  onClick={() => activeEditSection !== 'name' && setActiveEditSection('name')}
                  className={`settings-row ${activeEditSection !== 'name' ? 'clickable' : ''}`}
                >
                  {activeEditSection !== 'name' ? (
                    <div className="settings-row-header">
                      <div className="settings-label">NOM ET PRÉNOM</div>
                      <div className="settings-value">{prenom} {nom}</div>
                      <div className="settings-arrow">›</div>
                    </div>
                  ) : (
                    <form onSubmit={handleGeneralSubmit} className="settings-expanded-content" onClick={(e) => e.stopPropagation()}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>MODIFIER LE NOM ET PRÉNOM</div>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1 }}><input type="text" value={editNom} onChange={(e) => setEditNom(e.target.value)} required className="form-input" placeholder="Nom" /></div>
                        <div style={{ flex: 1 }}><input type="text" value={editPrenom} onChange={(e) => setEditPrenom(e.target.value)} required className="form-input" placeholder="Prénom" /></div>
                      </div>
                      <div className="form-action-panel">
                        <button type="button" onClick={cancelEdition} className="btn-secondary">Annuler</button>
                        <button type="submit" className="btn-primary">Enregistrer</button>
                      </div>
                    </form>
                  )}
                </div>

                <div 
                  onClick={() => activeEditSection !== 'pseudo' && setActiveEditSection('pseudo')}
                  className={`settings-row ${activeEditSection !== 'pseudo' ? 'clickable' : ''}`}
                >
                  {activeEditSection !== 'pseudo' ? (
                    <div className="settings-row-header">
                      <div className="settings-label">PSEUDO</div>
                      <div className="settings-value">{pseudo}</div>
                      <div className="settings-arrow">›</div>
                    </div>
                  ) : (
                    <form onSubmit={handleGeneralSubmit} className="settings-expanded-content" onClick={(e) => e.stopPropagation()}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '1rem' }}>MODIFIER LE NOM D'UTILISATEUR</div>
                      <div style={{ marginBottom: '1rem' }}><input type="text" value={editPseudo} onChange={(e) => setEditPseudo(e.target.value)} required className="form-input" placeholder="Pseudo" /></div>
                      <div className="form-action-panel">
                        <button type="button" onClick={cancelEdition} className="btn-secondary">Annuler</button>
                        <button type="submit" className="btn-primary">Enregistrer</button>
                      </div>
                    </form>
                  )}
                </div>

                <div 
                  onClick={() => activeEditSection !== 'email' && setActiveEditSection('email')}
                  className={`settings-row ${activeEditSection !== 'email' ? 'clickable' : ''}`}
                >
                  {activeEditSection !== 'email' ? (
                    <div className="settings-row-header">
                      <div className="settings-label">ADRESSE EMAIL</div>
                      <div className="settings-value">{emailActuel}</div>
                      <div className="settings-arrow">›</div>
                    </div>
                  ) : (
                    <div className="settings-expanded-content" onClick={(e) => e.stopPropagation()}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>MODIFIER L'ADRESSE EMAIL</div>
                      {stepEmail === 1 ? (
                        <form onSubmit={handleEmailRequestSubmit}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Une demande de validation sera transmise simultanément à l'ancienne et à la nouvelle boîte de réception.</p>
                          <div style={{ marginBottom: '1rem' }}><input type="email" value={nouvelEmail} onChange={(e) => setNouvelEmail(e.target.value)} required className="form-input" placeholder="Nouvelle adresse email" /></div>
                          <div className="form-action-panel">
                            <button type="button" onClick={cancelEdition} className="btn-secondary">Annuler</button>
                            <button type="submit" className="btn-primary">Suivant</button>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleEmailConfirmSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <input type="text" maxLength="6" value={codeAncienEmail} onChange={(e) => setCodeAncienEmail(e.target.value)} required className="form-input" placeholder="Code reçu sur l'ancienne adresse" />
                            <input type="text" maxLength="6" value={codeNouveauEmail} onChange={(e) => setCodeNouveauEmail(e.target.value)} required className="form-input" placeholder="Code reçu sur la nouvelle adresse" />
                          </div>
                          <div className="form-action-panel">
                            <button type="button" onClick={() => setStepEmail(1)} className="btn-secondary">Retour</button>
                            <button type="submit" className="btn-primary">Confirmer la mutation</button>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'securite' && (
              <>
                <div 
                  onClick={() => activeEditSection !== 'password' && setActiveEditSection('password')}
                  className={`settings-row ${activeEditSection !== 'password' ? 'clickable' : ''}`}
                >
                  {activeEditSection !== 'password' ? (
                    <div className="settings-row-header">
                      <div className="settings-label">MOT DE PASSE</div>
                      <div className="settings-value">••••••••••••</div>
                      <div className="settings-arrow">›</div>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordSubmit} className="settings-expanded-content" onClick={(e) => e.stopPropagation()}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '1rem' }}>MODIFIER LE MOT DE PASSE DE SÉCURITÉ</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input type={showAncienMdp ? 'text' : 'password'} value={ancienMdp} onChange={(e) => setAncienMdp(e.target.value)} required className="form-input" style={{ paddingRight: '4rem' }} placeholder="Mot de passe actuel" />
                          <button type="button" onClick={() => setShowAncienMdp(!showAncienMdp)} className="toggle-password-btn">{showAncienMdp ? 'Masquer' : 'Afficher'}</button>
                        </div>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <input type={showNouveauMdp ? 'text' : 'password'} value={nouveauMdp} onChange={(e) => setNouveauMdp(e.target.value)} required className="form-input" style={{ paddingRight: '4rem' }} placeholder="Nouveau mot de passe (6 car. min)" />
                          <button type="button" onClick={() => setShowNouveauMdp(!showNouveauMdp)} className="toggle-password-btn">{showNouveauMdp ? 'Masquer' : 'Afficher'}</button>
                        </div>
                      </div>
                      <div className="form-action-panel">
                        <button type="button" onClick={cancelEdition} className="btn-secondary">Annuler</button>
                        <button type="submit" className="btn-primary">Mettre à jour</button>
                      </div>
                    </form>
                  )}
                </div>

                <div 
                  onClick={() => activeEditSection !== 'delete' && setActiveEditSection('delete')}
                  className={`settings-row ${activeEditSection !== 'delete' ? 'clickable' : ''}`}
                  style={{ backgroundColor: activeEditSection === 'delete' ? 'transparent' : 'rgba(255, 77, 77, 0.01)' }}
                >
                  {activeEditSection !== 'delete' ? (
                    <div className="settings-row-header">
                      <div className="settings-label" style={{ color: '#ff4d4d' }}>SUPPRESSION DU COMPTE</div>
                      <div className="settings-value" style={{ color: '#ff4d4d', fontSize: '0.9rem', opacity: '0.9' }}>Fermer définitivement le profil Heracles</div>
                      <div className="settings-arrow">›</div>
                    </div>
                  ) : (
                    <div className="settings-expanded-content" onClick={(e) => e.stopPropagation()}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ff4d4d', marginBottom: '0.5rem' }}>SUPPRIMER LE COMPTE ATHLÈTE / COACH</div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                        Attention, cette action est irréversible. Toutes vos données de performance, d'équipes et d'historiques associées seront supprimées définitivement des serveurs.
                      </p>
                      <div className="form-action-panel">
                        <button type="button" onClick={cancelEdition} className="btn-secondary">Annuler</button>
                        <button type="button" onClick={handleDeleteAccount} className="btn-primary" style={{ backgroundColor: '#ff4d4d' }}>
                          Confirmer la suppression complète
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;