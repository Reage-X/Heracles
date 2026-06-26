import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Card from '../components/Card';

const ManageEquipe = ({ setCurrentView, equipe, setSelectedStructure }) => {
  const [activeTab, setActiveTab] = useState('infos');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [equipeData, setEquipeData] = useState(null);
  const [equipeNom, setEquipeNom] = useState(equipe?.nom || '');
  const [coachs, setCoachs] = useState(equipe?.coachs || []);
  const [athletes, setAthletes] = useState(equipe?.joueurs || []);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [activeEditSection, setActiveEditSection] = useState(null);
  const [editNom, setEditNom] = useState(equipe?.nom || '');
  
  const [showTransferList, setShowTransferList] = useState(false);
  const [searchTransfer, setSearchTransfer] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const equipeId = equipe?.id || equipe?._id;

  useEffect(() => {
    if (equipeId) {
      fetchEquipeComplete();
    }
    fetchUtilisateurConnecte();
  }, [equipeId]);

  const fetchUtilisateurConnecte = async () => {
    try {
      const response = await API.get('/r_utilisateur/profil');
      setCurrentUserId(response.data.id || response.data._id);
    } catch (error) { 
      console.error(error); 
    }
  };

  const fetchEquipeComplete = async () => {
    setErrorMsg('');
    try {
      const response = await API.get(`/r_equipe/${equipeId}`);
      setEquipeData(response.data);
      setEquipeNom(response.data.nom);
      setEditNom(response.data.nom);
      setCoachs(response.data.coachs || []);
      setAthletes(response.data.joueurs || []);
    } catch (error) { 
      const detailErreur = error.response?.data?.error || error.message || "Erreur réseau";
      setErrorMsg(`Erreur de synchronisation (Équipe) : ${detailErreur}`);
    }
  };

  const handleUpdateEquipeName = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    if (!editNom.trim()) return;

    try {
      setLoading(true);
      await API.put(`/r_equipe/${equipeId}`, { nom: editNom.trim() });
      setEquipeNom(editNom.trim());
      setSuccessMsg("Nom mis à jour avec succès.");
      setActiveEditSection(null);
    } catch (err) { 
      setErrorMsg(err.response?.data?.error || "Erreur de modification."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleAddCoach = async () => {
    const pseudo = prompt("Pseudo exact du nouveau Coach :");
    if (!pseudo || !pseudo.trim()) return;

    try {
      setLoading(true); setErrorMsg(''); setSuccessMsg('');
      await API.put(`/r_equipe/${equipeId}/ajouter-coach`, { pseudo: pseudo.trim() });
      setSuccessMsg("Coach ajouté.");
      fetchEquipeComplete();
    } catch (err) { 
      setErrorMsg(err.response?.data?.error || "Introuvable."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleRemoveCoach = async (coachId, name) => {
    if (!window.confirm(`Révoquer ${name} de ses fonctions ?`)) return;

    try {
      setLoading(true); setErrorMsg(''); setSuccessMsg('');
      await API.put(`/r_equipe/${equipeId}/revoquer-coach`, { coachId });
      setSuccessMsg("Coach révoqué.");
      fetchEquipeComplete();
    } catch (err) { 
      setErrorMsg(err.response?.data?.error || "Erreur de révocation."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleAddAthlete = async () => {
    const pseudo = prompt("Pseudo de l'Athlète à inscrire :");
    if (!pseudo || !pseudo.trim()) return;

    try {
      setLoading(true); setErrorMsg(''); setSuccessMsg('');
      await API.put(`/r_equipe/${equipeId}/ajouter-athlete`, { pseudo: pseudo.trim() });
      setSuccessMsg("Athlète inscrit.");
      fetchEquipeComplete();
    } catch (err) { 
      setErrorMsg(err.response?.data?.error || "Introuvable."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleRemoveAthlete = async (athleteId, name) => {
    if (!window.confirm(`Désinscrire ${name} ?`)) return;

    try {
      setLoading(true); setErrorMsg(''); setSuccessMsg('');
      await API.put(`/r_equipe/${equipeId}/revoquer-athlete`, { athleteId });
      setSuccessMsg("Athlète retiré.");
      fetchEquipeComplete();
    } catch (err) { 
      setErrorMsg(err.response?.data?.error || "Erreur de retrait."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleTransferTeamLeadership = async (pseudoCible, nomComplet) => {
    if (!window.confirm(`Voulez-vous vraiment transférer la direction absolue de cette équipe à ${nomComplet} (@${pseudoCible}) ? Cette action est immédiate et irréversible.`)) return;

    try {
      setLoading(true); setErrorMsg(''); setSuccessMsg('');
      const response = await API.put(`/r_equipe/${equipeId}/transferer-createur`, { pseudo: pseudoCible });
      setSuccessMsg(response.data.message || "Mutation effectuée.");
      fetchEquipeComplete(); 
      setActiveEditSection(null);
      setShowTransferList(false);
      setSearchTransfer('');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "Le transfert a échoué.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEquipeComplete = async () => {
    if (!window.confirm("Supprimer définitivement cette équipe ? L'action est irréversible.")) return;

    try {
      setLoading(true);
      await API.delete(`/r_equipe/${equipeId}`);
      setSuccessMsg("Équipe dissoute.");
      setTimeout(() => { setCurrentView('affiliations'); }, 1500);
    } catch (err) { 
      setErrorMsg(err.response?.data?.error || "Erreur de dissolution."); 
    } finally { 
      setLoading(false); 
    }
  };

  const cancelEdition = () => {
    setActiveEditSection(null);
    setErrorMsg(''); setSuccessMsg('');
    setEditNom(equipeNom);
    setShowTransferList(false); 
    setSearchTransfer('');
  };

  const handleGoBack = () => {
    setCurrentView('affiliations');
  };

  const handleGoToStructure = () => {
    setCurrentView('manage-structure');
  };

  const structureAdmins = equipeData?.structureId?.administrateurs || [];
  const isStructureAdmin = structureAdmins.some(admin => (admin._id || admin.id || admin) === currentUserId);
  const isTeamCreator = equipeData?.createur === currentUserId || equipeData?.createur?._id === currentUserId || equipeData?.createur?.id === currentUserId;
  const isCoach = coachs.some(c => (c.id || c._id || c) === currentUserId);

  const teamCreatorIdNormalized = equipeData?.createur?.id || equipeData?.createur?._id || equipeData?.createur;

  const sortedCoachs = [...coachs].sort((a, b) => {
    const idA = a.id || a._id;
    const idB = b.id || b._id;
    if (idA === teamCreatorIdNormalized) return -1;
    if (idB === teamCreatorIdNormalized) return 1;
    return `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`);
  });

  const potentialTransferCandidates = coachs.filter(c => (c.id || c._id) !== teamCreatorIdNormalized);

  const filteredCoachsForTransfer = potentialTransferCandidates
    .filter(c => {
      const searchLower = searchTransfer.toLowerCase();
      const nomComplet = `${c.prenom} ${c.nom}`.toLowerCase();
      return nomComplet.includes(searchLower) || c.pseudo.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`));

  return (
    <div className="sidebar-page-wrapper">
      <aside className={`sidebar-aside ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="sidebar-collapse-btn">‹</button>
        
        <button onClick={() => { setActiveTab('infos'); cancelEdition(); }} className={`sidebar-nav-btn ${activeTab === 'infos' ? 'active' : ''}`}>
          <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>📋</span>
          {!isCollapsed && <span style={{ marginLeft: '1rem', fontSize: '0.95rem' }}>Information</span>}
        </button>
        
        {(isCoach || isStructureAdmin) && (
          <button onClick={() => { setActiveTab('coachs'); cancelEdition(); }} className={`sidebar-nav-btn ${activeTab === 'coachs' ? 'active' : ''}`} style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🎓</span>
            {!isCollapsed && <span style={{ marginLeft: '1rem', fontSize: '0.95rem' }}>Coachs</span>}
          </button>
        )}
        
        <button onClick={() => { setActiveTab('athletes'); cancelEdition(); }} className={`sidebar-nav-btn ${activeTab === 'athletes' ? 'active' : ''}`} style={{ marginTop: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🏃</span>
          {!isCollapsed && <span style={{ marginLeft: '1rem', fontSize: '0.95rem' }}>Athlètes</span>}
        </button>

        {(isTeamCreator || isStructureAdmin) && (
          <button onClick={() => { setActiveTab('securite'); cancelEdition(); }} className={`sidebar-nav-btn ${activeTab === 'securite' ? 'active' : ''}`} style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🔒</span>
            {!isCollapsed && <span style={{ marginLeft: '1rem', fontSize: '0.95rem' }}>Sécurité</span>}
          </button>
        )}

        <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <button onClick={handleGoToStructure} className="sidebar-nav-btn" style={{ color: 'var(--accent-blue)' }}>
            <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🏢</span>
            {!isCollapsed && <span style={{ marginLeft: '1rem', fontSize: '0.95rem' }}>Vers la structure</span>}
          </button>
        </div>
      </aside>

      <section style={{ flex: 1, padding: '4rem 2rem 2rem 2rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {errorMsg && <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', textAlign: 'left' }}>{errorMsg}</div>}
          {successMsg && <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', textAlign: 'left' }}>{successMsg}</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-main)', margin: '0' }}>
                {activeTab === 'infos' && `Équipe : ${equipeNom}`}
                {activeTab === 'coachs' && "Staff Technique"}
                {activeTab === 'athletes' && "Effectif des Athlètes"}
                {activeTab === 'securite' && "Sécurité de l'Équipe"}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {activeTab === 'coachs' && (isTeamCreator || isStructureAdmin) && <button onClick={handleAddCoach} className="btn-primary">Rajouter</button>}
              {activeTab === 'athletes' && (isCoach || isStructureAdmin) && <button onClick={handleAddAthlete} className="btn-primary">Rajouter</button>}
              <button onClick={handleGoBack} className="btn-secondary">← Retour</button>
            </div>
          </div>

          <div className="settings-card">
            {activeTab === 'infos' && (
              <div onClick={() => (isCoach || isStructureAdmin) && setActiveEditSection('name')} className={`settings-row ${(isCoach || isStructureAdmin) ? 'clickable' : ''}`}>
                <div className="settings-row-header">
                  <div className="settings-label">NOM DE L'ÉQUIPE</div>
                  <div className="settings-value">
                    {activeEditSection === 'name' ? (
                      <form onSubmit={handleUpdateEquipeName} className="settings-expanded-content" onClick={e => e.stopPropagation()} style={{ width: '100%' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                          <input type="text" value={editNom} onChange={e => setEditNom(e.target.value)} required className="form-input" />
                          <button type="submit" disabled={loading} className="btn-primary">Ok</button>
                          <button type="button" onClick={cancelEdition} className="btn-secondary">Annuler</button>
                        </div>
                      </form>
                    ) : equipeNom}
                  </div>
                  {(isCoach || isStructureAdmin) && activeEditSection !== 'name' && <div className="settings-arrow">›</div>}
                </div>
              </div>
            )}
          </div>

          {activeTab === 'coachs' && (
            <div style={{ display: 'flex', flexDirection: 'row', gap: '1.25rem', overflowX: 'auto', width: '100%', paddingBottom: '1.25rem', scrollbarWidth: 'thin' }}>
              {sortedCoachs.map((c) => {
                 const isCreatorMap = (equipeData?.createur?.id || equipeData?.createur?._id || equipeData?.createur) === (c.id || c._id);
                 return (
                  <Card 
                    key={c.id || c._id}
                    title={`${c.prenom} ${c.nom}`}
                    subtitle1={isCreatorMap ? "Coach Principal" : "Coach Assigné"}
                    actionArea={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <button type="button" style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: '700', cursor: 'pointer', padding: '0.4rem 0' }}>Entrée</button>
                        {(isTeamCreator || isStructureAdmin) && !isCreatorMap ? (
                          <button onClick={() => handleRemoveCoach(c.id || c._id, c.prenom)} style={{ background: 'none', border: 'none', color: '#ff4d4d', fontSize: '1.2rem', cursor: 'pointer' }}>⎋</button>
                        ) : <div style={{ width: '24px' }} />}
                      </div>
                    }
                  />
                );
              })}
            </div>
          )}

          {activeTab === 'athletes' && (
            athletes.length === 0 ? <p style={{ textAlign: 'left', color: 'var(--text-muted)' }}>Aucun athlète dans l'effectif.</p> :
            <div style={{ display: 'flex', flexDirection: 'row', gap: '1.25rem', overflowX: 'auto', width: '100%', paddingBottom: '1.25rem', scrollbarWidth: 'thin' }}>
              {athletes.map(a => (
                <Card 
                  key={a.id || a._id}
                  title={`${a.prenom} ${a.nom}`}
                  actionArea={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <button type="button" style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: '700', cursor: 'pointer', padding: '0.4rem 0' }}>Entrée</button>
                      {(isCoach || isStructureAdmin) && <button onClick={() => handleRemoveAthlete(a.id || a._id, a.prenom)} style={{ background: 'none', border: 'none', color: '#ff4d4d', fontSize: '1.2rem', cursor: 'pointer' }}>⎋</button>}
                    </div>
                  }
                />
              ))}
            </div>
          )}

          {activeTab === 'securite' && (isTeamCreator || isStructureAdmin) && (
            <div className="settings-card" style={{ display: 'flex', flexDirection: 'column' }}>
              
              <div onClick={() => activeEditSection !== 'transfer' && setActiveEditSection('transfer')} className={`settings-row ${activeEditSection !== 'transfer' ? 'clickable' : ''}`}>
                <div className="settings-row-header" style={{ alignItems: activeEditSection === 'transfer' ? 'flex-start' : 'center' }}>
                  <div className="settings-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: activeEditSection === 'transfer' ? '0.1rem' : '0' }}>
                    <div style={{ whiteSpace: 'nowrap' }}>COACH PRINCIPAL</div>
                    {activeEditSection === 'transfer' && showTransferList && (
                      <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTransfer}
                        onChange={(e) => setSearchTransfer(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.8rem', outline: 'none' }}
                      />
                    )}
                  </div>
                  
                  <div className="settings-value">
                    {activeEditSection === 'transfer' ? (
                      <div className="settings-expanded-content" onClick={e => e.stopPropagation()} style={{ marginTop: 0 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>TRANSFÉRER LA DIRECTION</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem', lineHeight: '1.4' }}>
                          Cette action transmettra immédiatement les privilèges exclusifs de manager à l'utilisateur ciblé.
                        </p>
                        
                        {!showTransferList ? (
                          <div className="form-action-panel">
                            <button type="button" onClick={cancelEdition} className="btn-secondary">Annuler</button>
                            <button type="button" onClick={() => setShowTransferList(true)} className="btn-primary">Continuer</button>
                          </div>
                        ) : (
                          <>
                            <div style={{ display: 'flex', flexDirection: 'row', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'thin' }}>
                              {filteredCoachsForTransfer.length === 0 ? (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Aucun autre coach trouvé.</p>
                              ) : (
                                filteredCoachsForTransfer.map(c => {
                                  const coachId = c.id || c._id;
                                  const nomComplet = `${c.prenom} ${c.nom}`;
                                  return (
                                    <Card 
                                      key={coachId}
                                      title={nomComplet}
                                      subtitle1={`@${c.pseudo}`}
                                      minWidth="180px"
                                      actionArea={
                                        <button type="button" onClick={() => handleTransferTeamLeadership(c.pseudo, nomComplet)} style={{ background: 'none', border: 'none', color: '#ff4d4d', fontWeight: '800', cursor: 'pointer', width: '100%', marginTop: '0.5rem' }}>Transférer</button>
                                      }
                                    />
                                  );
                                })
                              )}
                            </div>
                            <div className="form-action-panel" style={{ marginTop: '0.5rem' }}>
                              <button type="button" onClick={cancelEdition} className="btn-secondary">Annuler la procédure</button>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      "Transférer les privilèges de management exclusifs"
                    )}
                  </div>
                  {activeEditSection !== 'transfer' && <div className="settings-arrow">›</div>}
                </div>
              </div>

              <div onClick={() => activeEditSection !== 'delete' && setActiveEditSection('delete')} className={`settings-row ${activeEditSection !== 'delete' ? 'clickable' : ''}`} style={{ backgroundColor: 'rgba(255, 77, 77, 0.01)', borderTop: '1px solid var(--border-color)' }}>
                <div className="settings-row-header">
                  <div className="settings-label" style={{ color: '#ff4d4d' }}>SUPPRESSION</div>
                  <div className="settings-value">
                    {activeEditSection === 'delete' ? (
                      <div className="settings-expanded-content" onClick={e => e.stopPropagation()}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Opération irréversible. Les athlètes perdront leurs fiches d'entraînements rattachées.</p>
                        <div className="form-action-panel">
                          <button type="button" onClick={cancelEdition} className="btn-secondary">Annuler</button>
                          <button type="button" onClick={handleDeleteEquipeComplete} className="btn-primary" style={{ backgroundColor: '#ff4d4d' }}>Confirmer</button>
                        </div>
                      </div>
                    ) : "Dissoudre définitivement l'équipe"}
                  </div>
                  {activeEditSection !== 'delete' && <div className="settings-arrow">›</div>}
                </div>
              </div>

            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ManageEquipe;