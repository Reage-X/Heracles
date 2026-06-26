import React, { useState, useEffect } from 'react';
import API from '../services/api';

const Affiliations = ({ setCurrentView, setSelectedStructure, setSelectedEquipe }) => {
  const [structures, setStructures] = useState([]);
  const [equipes, setEquipes] = useState([]);
  const [roles, setRoles] = useState([]);
  
  const [searchStructure, setSearchStructure] = useState('');
  const [searchEquipe, setSearchEquipe] = useState('');
  const [searchRole, setSearchRole] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Anti-cache navigateur
      const t = new Date().getTime();
      
      const [responseStructures, responseEquipes, responseProfil] = await Promise.all([
        API.get(`/r_structure?t=${t}`),
        API.get(`/r_equipe?t=${t}`),
        API.get(`/r_utilisateur/profil?t=${t}`)
      ]);

      const currentUserId = responseProfil.data.id || responseProfil.data._id;
      setStructures(responseStructures.data);
      setEquipes(responseEquipes.data);

      const computedRoles = [];

      // 1. Rôles liés à l'administration des Structures
      responseStructures.data.forEach((structure) => {
        const createurId = structure.createur?.id || structure.createur?._id || structure.createur;
        const isFondateur = createurId === currentUserId;
        
        if (isFondateur) {
          computedRoles.push({
            id: `fondateur-${structure.id || structure._id}`,
            nom: 'Fondateur',
            emoji: '👑',
            description: `Créateur et administrateur suprême de l'organisation : ${structure.nom}`
          });
        } else {
          const isSousDirecteur = structure.administrateurs?.some(admin => (admin.id || admin._id || admin) === currentUserId);
          if (isSousDirecteur) {
            computedRoles.push({
              id: `sousdir-${structure.id || structure._id}`,
              nom: 'Sous-directeur',
              emoji: '👔',
              description: `Membre du conseil d'administration de l'organisation : ${structure.nom}`
            });
          }
        }
      });

      // 2. Rôles liés à l'encadrement et la participation aux Équipes
      responseEquipes.data.forEach((equipe) => {
        const createurId = equipe.createur?.id || equipe.createur?._id || equipe.createur;
        const isCoachPrincipal = createurId === currentUserId;
        
        const isCoach = equipe.coachs?.some(c => (c.id || c._id || c) === currentUserId);
        const isJoueur = equipe.joueurs?.some(j => (j.id || j._id || j) === currentUserId);

        if (isCoachPrincipal) {
          computedRoles.push({
            id: `coachprinc-${equipe.id || equipe._id}`,
            nom: 'Coach Principal',
            emoji: '📋',
            description: `Fondateur et manager principal de la division : ${equipe.nom}`
          });
        } else if (isCoach) {
          computedRoles.push({
            id: `coach-${equipe.id || equipe._id}`,
            nom: 'Coach',
            emoji: '🎓',
            description: `Membre du staff technique de l'équipe : ${equipe.nom}`
          });
        }

        if (isJoueur) {
          computedRoles.push({
            id: `athlete-${equipe.id || equipe._id}`,
            nom: 'Athlète',
            emoji: '🏃',
            description: `Athlète titulaire inscrit dans l'effectif : ${equipe.nom}`
          });
        }
      });

      // Tri hiérarchique des rôles
      const ordreHierarchie = {
        'Fondateur': 1,
        'Sous-directeur': 2,
        'Coach Principal': 3,
        'Coach': 4,
        'Athlète': 5
      };

      computedRoles.sort((a, b) => {
        const poidsA = ordreHierarchie[a.nom] || 99;
        const poidsB = ordreHierarchie[b.nom] || 99;
        return poidsA - poidsB;
      });

      setRoles(computedRoles);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredStructures = structures.filter(s => 
    s.nom?.toLowerCase().includes(searchStructure.toLowerCase())
  );
  const filteredEquipes = equipes.filter(e => 
    e.nom?.toLowerCase().includes(searchEquipe.toLowerCase())
  );
  const filteredRoles = roles.filter(r => 
    r.nom?.toLowerCase().includes(searchRole.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchRole.toLowerCase())
  );

  return (
    <div style={{ width: '100%', maxWidth: '90%', padding: '0 2rem 2em 2rem', color: 'var(--text-muted)' }}>
      <h1 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', textAlign: 'left' }}>🏛️ Mes Affiliations</h1>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#ffdddd', color: '#d8000c', borderRadius: '4px', marginBottom: '1.5rem', fontWeight: 'bold' }}>
          {error}
        </div>
      )}

      {/* SECTION : STRUCTURES */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', margin: 0, minWidth: '200px', color: 'var(--text-main)' }}>Mes structures</h2>
            <input
              type="text"
              placeholder="Rechercher une structure..."
              value={searchStructure}
              onChange={(e) => setSearchStructure(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
          <button type="button" className="btn-primary" onClick={() => setCurrentView('create-structure')}>Créer</button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'left' }}>Chargement des structures...</p>
        ) : filteredStructures.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', marginBottom: '4rem', textAlign: 'left' }}>Aucune structure trouvée. Créez-en une pour commencer !</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1.25rem', overflowX: 'auto', paddingTop: '0.5rem', paddingBottom: '1.25rem', width: '100%', scrollbarWidth: 'thin' }}>
            {filteredStructures.map((structure) => (
              <div key={structure.id || structure._id} className="map-card">
                <div style={{ textAlign: 'left', width: '100%' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                    {structure.nom}
                  </h3>
                  <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Directeur : {structure.createur ? `${structure.createur.prenom} ${structure.createur.nom}` : 'Non renseigné'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '0.25rem' }}>
                  <button 
                    type="button" 
                    style={{ background: 'none', border: 'none', padding: '0.4rem 0', fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-blue)', cursor: 'pointer', outline: 'none', transition: 'opacity 0.2s ease' }}
                    onClick={(e) => { e.stopPropagation(); setSelectedStructure(structure); setCurrentView('manage-structure'); }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Entrée
                  </button>
                  <button 
                    type="button" 
                    title="Gérer la structure"
                    onClick={(e) => { e.stopPropagation(); setSelectedStructure(structure); setCurrentView('manage-structure'); }}
                    style={{ background: 'none', border: 'none', padding: '0.4rem 0', fontSize: '1.15rem', cursor: 'pointer', outline: 'none', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION : ÉQUIPES */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', margin: 0, minWidth: '200px', color: 'var(--text-main)' }}>Mes Equipes</h2>
            <input
              type="text"
              placeholder="Rechercher une équipe..."
              value={searchEquipe}
              onChange={(e) => setSearchEquipe(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'left' }}>Chargement des equipes...</p>
        ) : filteredEquipes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', marginBottom: '4rem', textAlign: 'left' }}>Aucune Équipe trouvée.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1.25rem', overflowX: 'auto', paddingTop: '0.5rem', paddingBottom: '1.25rem', width: '100%', scrollbarWidth: 'thin' }}>
            {filteredEquipes.map((equipe) => (
              <div key={equipe.id || equipe._id} className="map-card" style={{ cursor: 'default' }}>
                <div style={{ textAlign: 'left', width: '100%' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>{equipe.nom}</h3>
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Coachs : {equipe.coachs?.length || 0}
                  </p>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Athlètes : {equipe.joueurs?.length || 0}
                  </p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingBottom: '0.25rem' }}>
                  <button 
                    type="button" 
                    style={{ background: 'none', border: 'none', padding: '0.4rem 0', fontSize: '0.9rem', fontWeight: '700', color: 'var(--accent-blue)', cursor: 'pointer', outline: 'none', transition: 'opacity 0.2s' }}
                    onClick={(e) => { e.stopPropagation(); if(equipe.structureId) setSelectedStructure(equipe.structureId); setSelectedEquipe(equipe); setCurrentView('manage-equipe'); }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Entrée
                  </button>
                  
                  <button 
                    type="button" 
                    title="Gérer l'équipe"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Configuration de la structure parente avant redirection vers l'équipe
                      if (equipe.structureId) {
                        setSelectedStructure(equipe.structureId);
                      }
                      setSelectedEquipe(equipe);
                      setCurrentView('manage-equipe');
                    }}
                    style={{ background: 'none', border: 'none', padding: '0.4rem 0', fontSize: '1.15rem', cursor: 'pointer', outline: 'none', transition: 'color 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-blue)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION : RÔLES */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.4rem', margin: 0, minWidth: '200px', color: 'var(--text-main)', textAlign: 'left' }}>Mes Rôles</h2>
            <input
              type="text"
              placeholder="Rechercher un rôle..."
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', outline: 'none' }}
            />
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'left' }}>Chargement des rôles...</p>
        ) : filteredRoles.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', marginBottom: '4rem', textAlign: 'left' }}>Vous n'avez aucun rôle attribué dans les équipes ou structures pour le moment.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '1.25rem', overflowX: 'auto', paddingTop: '0.5rem', paddingBottom: '1.25rem', width: '100%', scrollbarWidth: 'thin' }}>
            {filteredRoles.map((role) => (
              <div key={role.id} className="map-card" style={{ cursor: 'default' }}>
                <div style={{ textAlign: 'left', width: '100%' }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                    {role.emoji} {role.nom}
                  </h3>
                  <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.3' }}>
                    {role.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Affiliations;