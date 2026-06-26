import React, { useState, useEffect } from 'react';
import API from '../services/api';
import Card from '../components/Card';

const ManageStructure = ({ setCurrentView, structure, setSelectedEquipe }) => {
  const [activeTab, setActiveTab] = useState('infos');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [structureNom, setStructureNom] = useState(structure?.nom || '');
  const [administrateurs, setAdministrateurs] = useState(structure?.administrateurs || []);
  const [equipes, setEquipes] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [activeEditSection, setActiveEditSection] = useState(null);
  const [editNom, setEditNom] = useState(structure?.nom || '');
  
  const [showTransferList, setShowTransferList] = useState(false);
  const [searchTransfer, setSearchTransfer] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEquipes, setLoadingEquipes] = useState(false);

  const structureId = structure?.id || structure?._id;

  useEffect(() => {
    if (structureId) {
      fetchStructureComplete();
      fetchEquipesAssociees();
    }
    fetchUtilisateurConnecte();
  }, [structureId]);

  const fetchUtilisateurConnecte = async () => {
    try {
      const response = await API.get('/r_utilisateur/profil');
      setCurrentUserId(response.data.id || response.data._id);
    } catch (error) {
      console.error("Erreur lors du chargement du profil connecté.");
    }
  };

  const fetchStructureComplete = async () => {
    setErrorMsg('');
    try {
      const response = await API.get(`/r_structure/${structureId}`);
      setStructureNom(response.data.nom);
      setEditNom(response.data.nom);
      setAdministrateurs(response.data.administrateurs || []);
    } catch (error) {
      const detailErreur = error.response?.data?.error || error.message || "Erreur réseau";
      setErrorMsg(`Erreur de synchronisation (Structure) : ${detailErreur}`);
    }
  };

  const fetchEquipesAssociees = async () => {
    try {
      setLoadingEquipes(true);
      const response = await API.get(`/r_equipe?structureId=${structureId}`);
      setEquipes(response.data || []);
    } catch (error) {
      console.error("Erreur API Équipes associées:", error);
    } finally {
      setLoadingEquipes(false);
    }
  };

  const handleUpdateStructureName = async (e) => {
    e.preventDefault();
    setErrorMsg(''); setSuccessMsg('');
    if (!editNom.trim()) return;

    try {
      setLoading(true);
      await API.put(`/r_structure/${structureId}`, { nom: editNom.trim() });
      setStructureNom(editNom.trim());
      setSuccessMsg("Le nom de l'organisation a été modifié avec succès.");
      setActiveEditSection(null);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de la modification du nom.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    const pseudoCible = prompt("Saisissez le pseudo exact du membre à nommer Directeur :");
    if (!pseudoCible || !pseudoCible.trim()) return;

    setErrorMsg(''); setSuccessMsg('');
    try {
      setLoading(true);
      await API.put(`/r_structure/${structureId}/ajouter-admin`, { pseudo: pseudoCible.trim() });
      setSuccessMsg("Nouveau directeur rattaché au conseil d'administration.");
      fetchStructureComplete();
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Impossible de trouver ou d'affecter ce membre.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAdmin = async (adminId, adminNom) => {
    if (!window.confirm(`Voulez-vous révoquer les droits de direction de ${adminNom} ?`)) return;
    
    setErrorMsg(''); setSuccessMsg('');
    try {
      setLoading(true);
      await API.put(`/r_structure/${structureId}/revoquer-admin`, { adminId });
      setSuccessMsg(`Les privilèges de direction de ${adminNom} ont été révoqués.`);
      fetchStructureComplete();
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de la destitution.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEquipeInterne = async () => {
    const nomNouvelleEquipe = prompt("Saisissez le nom de la nouvelle équipe sportive :");
    if (!nomNouvelleEquipe || !nomNouvelleEquipe.trim()) return;

    setErrorMsg(''); setSuccessMsg('');
    try {
      setLoading(true);
      await API.post('/r_equipe', { nom: nomNouvelleEquipe.trim(), structureId: structureId });
      setSuccessMsg(`L'équipe "${nomNouvelleEquipe.trim()}" a été créée avec succès.`);
      fetchEquipesAssociees();
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de la création de l'équipe.");
    } finally {
      setLoading(false);
    }
  };

  const handleTransferStructureLeadership = async (pseudoCible, nomComplet) => {
    if (!window.confirm(`⚠️ ATTENTION : Voulez-vous vraiment transférer la propriété absolue de l'organisation à ${nomComplet} (@${pseudoCible}) ? Cette action est immédiate et irréversible.`)) return;

    try {
      setLoading(true); setErrorMsg(''); setSuccessMsg('');
      const response = await API.put(`/r_structure/${structureId}/transferer-createur`, { pseudo: pseudoCible });
      setSuccessMsg(response.data.message || "Passation effectuée.");
      fetchStructureComplete();
      setActiveEditSection(null);
      setShowTransferList(false);
      setSearchTransfer('');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || "La procédure de transfert a échoué.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStructure = async () => {
    if (!window.confirm(`⚠️ ATTENTION DANGER : Voulez-vous dissoudre définitivement la structure "${structureNom}" ? Cette action supprimera également en cascade toutes les équipes associées.`)) return;
    
    try {
      setLoading(true); setErrorMsg('');
      await API.delete(`/r_structure/${structureId}`);
      setSuccessMsg("Organisation et équipes rattachées supprimées avec succès.");
      setTimeout(() => { setCurrentView('affiliations'); }, 1500);
    } catch (error) {
      setErrorMsg(error.response?.data?.error || "Erreur lors de la dissolution de l'infrastructure.");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdition = () => {
    setActiveEditSection(null);
    setErrorMsg(''); setSuccessMsg('');
    setEditNom(structureNom);
    setShowTransferList(false); 
    setSearchTransfer('');
  };

  const isUserAdmin = administrateurs.some(admin => (admin.id || admin._id || admin) === currentUserId);
  const isCreator = structure?.createur === currentUserId || structure?.createur?.id === currentUserId || structure?.createur?._id === currentUserId;
  const creatorIdNormalized = structure?.createur?.id || structure?.createur?._id || structure?.createur;

  const sortedAdministrateurs = [...administrateurs].sort((a, b) => {
    const idA = a.id || a._id;
    const idB = b.id || b._id;
    if (idA === creatorIdNormalized) return -1;
    if (idB === creatorIdNormalized) return 1;
    return `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`);
  });

  const potentialTransferAdmins = administrateurs.filter(admin => (admin.id || admin._id) !== creatorIdNormalized);

  const filteredAdminsForTransfer = potentialTransferAdmins
    .filter(admin => {
      const searchLower = searchTransfer.toLowerCase();
      const nomComplet = `${admin.prenom} ${admin.nom}`.toLowerCase();
      return nomComplet.includes(searchLower) || admin.pseudo.toLowerCase().includes(searchLower);
    })
    .sort((a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`));

  return (
    <div className="sidebar-page-wrapper">
      <aside className={`sidebar-aside ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="sidebar-collapse-btn">{isCollapsed ? '›' : '‹'}</button>

        <button onClick={() => { setActiveTab('infos'); cancelEdition(); }} className={`sidebar-nav-btn ${activeTab === 'infos' ? 'active' : ''}`}>
          <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🏢</span>
          {!isCollapsed && <span style={{ marginLeft: '1rem', fontSize: '0.95rem' }}>Information</span>}
        </button>

        {isUserAdmin && (
          <button onClick={() => { setActiveTab('directeurs'); cancelEdition(); }} className={`sidebar-nav-btn ${activeTab === 'directeurs' ? 'active' : ''}`} style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>👑</span>
            {!isCollapsed && <span style={{ marginLeft: '1rem', fontSize: '0.95rem' }}>Directeurs</span>}
          </button>
        )}

        <button onClick={() => { setActiveTab('equipes'); cancelEdition(); }} className={`sidebar-nav-btn ${activeTab === 'equipes' ? 'active' : ''}`} style={{ marginTop: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>👥</span>
          {!isCollapsed && <span style={{ marginLeft: '1rem', fontSize: '0.95rem' }}>Équipes</span>}
        </button>

        {(isUserAdmin || isCreator) && (
          <button onClick={() => { setActiveTab('securite'); cancelEdition(); }} className={`sidebar-nav-btn ${activeTab === 'securite' ? 'active' : ''}`} style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🔒</span>
            {!isCollapsed && <span style={{ marginLeft: '1rem', fontSize: '0.95rem' }}>Sécurité</span>}
          </button>
        )}
      </aside>

      <section style={{ flex: 1, padding: '4rem 2rem 2rem 2rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {errorMsg && <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', textAlign: 'left' }}>{errorMsg}</div>}
          {successMsg && <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', textAlign: 'left' }}>{successMsg}</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>
                {activeTab === 'infos' && `Structure : ${structureNom}`}
                {activeTab === 'directeurs' && "Conseil d'administration"}
                {activeTab === 'equipes' && "Équipes rattachées"}
                {activeTab === 'securite' && "Paramètres de sécurité critique"}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {activeTab === 'directeurs' && isCreator && <button type="button" onClick={handleAddAdmin} className="btn-primary">Rajouter</button>}
              {activeTab === 'equipes' && isUserAdmin && <button type="button" onClick={() => setCurrentView('create-equipe')} className="btn-primary">Créer</button>}
              <button type="button" onClick={() => setCurrentView('affiliations')} className="btn-secondary">← Retour</button>
            </div>
          </div>

          {activeTab === 'infos' && (
            <div className="settings-card">
              <div onClick={() => isUserAdmin && activeEditSection !== 'name' && setActiveEditSection('name')} className={`settings-row ${isUserAdmin && activeEditSection !== 'name' ? 'clickable' : ''}`}>
                <div className="settings-row-header">
                  <div className="settings-label">NOM DE LA STRUCTURE</div>
                  <div className="settings-value">
                    {activeEditSection === 'name' ? (
                      <form onSubmit={handleUpdateStructureName} className="settings-expanded-content" onClick={(e) => e.stopPropagation()} style={{ width: '100%' }}>
                        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                          <input type="text" value={editNom} onChange={(e) => setEditNom(e.target.value)} required className="form-input" />
                          <button type="submit" disabled={loading} className="btn-primary">Ok</button>
                          <button type="button" onClick={cancelEdition} className="btn-secondary">Annuler</button>
                        </div>
                      </form>
                    ) : structureNom}
                  </div>
                  {isUserAdmin && activeEditSection !== 'name' && <div className="settings-arrow">›</div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'directeurs' && (
            <div style={{ display: 'flex', flexDirection: 'row', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1.25rem', scrollbarWidth: 'thin' }}>
              {sortedAdministrateurs.map((admin) => {
                const adminId = admin.id || admin._id;
                const nomComplet = `${admin.prenom} ${admin.nom}`;
                const estLeFondateur = adminId === creatorIdNormalized;

                return (
                  <Card 
                    key={adminId}
                    title={nomComplet}
                    subtitle1={estLeFondateur ? "Fondateur Suprême" : "Directeur"}
                    actionArea={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <button type="button" style={{ background: 'none', border: 'none', padding: '0.4rem 0', fontWeight: '700', color: 'var(--accent-blue)', cursor: 'pointer' }}>Entrée</button>
                        {isCreator && !estLeFondateur ? (
                          <button type="button" onClick={() => handleRemoveAdmin(adminId, nomComplet)} style={{ background: 'none', border: 'none', padding: '0.4rem 0', fontSize: '1.2rem', color: '#ff4d4d', cursor: 'pointer' }}>⎋</button>
                        ) : <div style={{ width: '24px' }} />}
                      </div>
                    }
                  />
                );
              })}
            </div>
          )}

          {activeTab === 'equipes' && (
            loadingEquipes ? <p style={{ textAlign: 'left', color: 'var(--text-muted)' }}>Chargement des équipes...</p> : 
            equipes.length === 0 ? <p style={{ textAlign: 'left', color: 'var(--text-muted)' }}>Aucune équipe rattachée.</p> : (
              <div style={{ display: 'flex', flexDirection: 'row', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1.25rem', scrollbarWidth: 'thin' }}>
                {equipes.map((eq) => {
                  const isCoachOfThisTeam = eq.coachs?.some(c => (c.id || c._id || c) === currentUserId);
                  const hasTeamAccess = isUserAdmin || isCoachOfThisTeam;

                  return (
                    <Card 
                      key={eq.id || eq._id}
                      title={eq.nom}
                      subtitle1={`Coachs : ${eq.coachs?.length || 0}`}
                      subtitle2={`Athlètes : ${eq.joueurs?.length || 0}`}
                      actionArea={hasTeamAccess ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '0.25rem' }}>
                          <button type="button" style={{ background: 'none', border: 'none', padding: '0.4rem 0', fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-blue)', cursor: 'pointer', outline: 'none' }}>Entrée</button>
                          <button type="button" title="Gérer l'équipe" onClick={(e) => { e.stopPropagation(); setSelectedEquipe(eq); setCurrentView('manage-equipe'); }} style={{ background: 'none', border: 'none', padding: '0.4rem 0', fontSize: '1.15rem', cursor: 'pointer', outline: 'none' }}>⚙️</button>
                        </div>
                      ) : null}
                    />
                  );
                })}
              </div>
            )
          )}

          {activeTab === 'securite' && (isUserAdmin || isCreator) && (
            <div className="settings-card" style={{ display: 'flex', flexDirection: 'column' }}>
              
              {isCreator && (
                <div onClick={() => activeEditSection !== 'transfer' && setActiveEditSection('transfer')} className={`settings-row ${activeEditSection !== 'transfer' ? 'clickable' : ''}`}>
                  <div className="settings-row-header" style={{ alignItems: activeEditSection === 'transfer' ? 'flex-start' : 'center' }}>
                    <div className="settings-label" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: activeEditSection === 'transfer' ? '0.1rem' : '0' }}>
                      <div style={{ whiteSpace: 'nowrap' }}>FONDATEUR SUPRÊME</div>
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
                          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--accent-blue)', marginBottom: '0.5rem' }}>TRANSFÉRER LA PROPRIÉTÉ</div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.2rem', lineHeight: '1.4' }}>
                            Cette action transmettra immédiatement les privilèges exclusifs de Fondateur suprême à l'utilisateur ciblé.
                          </p>
                          
                          {!showTransferList ? (
                            <div className="form-action-panel">
                              <button type="button" onClick={cancelEdition} className="btn-secondary">Annuler</button>
                              <button type="button" onClick={() => setShowTransferList(true)} className="btn-primary">Continuer</button>
                            </div>
                          ) : (
                            <>
                              <div style={{ display: 'flex', flexDirection: 'row', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'thin' }}>
                                {filteredAdminsForTransfer.length === 0 ? (
                                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>Aucun autre directeur trouvé.</p>
                                ) : (
                                  filteredAdminsForTransfer.map(admin => {
                                    const adminId = admin.id || admin._id;
                                    const nomComplet = `${admin.prenom} ${admin.nom}`;
                                    return (
                                      <Card 
                                        key={adminId}
                                        title={nomComplet}
                                        subtitle1={`@${admin.pseudo}`}
                                        minWidth="180px"
                                        actionArea={
                                          <button type="button" onClick={() => handleTransferStructureLeadership(admin.pseudo, nomComplet)} style={{ background: 'none', border: 'none', padding: '0.4rem 0', fontWeight: '800', color: '#ff4d4d', cursor: 'pointer', fontSize: '0.9rem', width: '100%', textAlign: 'center' }}>Transférer</button>
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
                      ) : "Transférer les privilèges de Fondateur suprême"}
                    </div>
                    {activeEditSection !== 'transfer' && <div className="settings-arrow">›</div>}
                  </div>
                </div>
              )}

              <div onClick={() => activeEditSection !== 'delete' && setActiveEditSection('delete')} className={`settings-row ${activeEditSection !== 'delete' ? 'clickable' : ''}`} style={{ backgroundColor: 'rgba(255, 77, 77, 0.01)', borderTop: isCreator ? '1px solid var(--border-color)' : 'none' }}>
                <div className="settings-row-header">
                  <div className="settings-label" style={{ color: '#ff4d4d' }}>DISSOLUTION</div>
                  <div className="settings-value">
                    {activeEditSection === 'delete' ? (
                      <div className="settings-expanded-content" onClick={(e) => e.stopPropagation()}>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Attention ! Cette opération est irréversible. Elle détruira la structure et toutes ses équipes.</p>
                        <div className="form-action-panel">
                          <button type="button" onClick={cancelEdition} className="btn-secondary">Annuler</button>
                          <button type="button" onClick={handleDeleteStructure} disabled={loading} className="btn-primary" style={{ backgroundColor: '#ff4d4d' }}>Confirmer</button>
                        </div>
                      </div>
                    ) : "Supprimer définitivement l'organisation"}
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

export default ManageStructure;