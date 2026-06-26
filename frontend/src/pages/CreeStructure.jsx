import React, { useState } from 'react';
import API from '../services/api';

const CreeStructure = ({ setCurrentView }) => {
  const [nom, setNom] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!nom.trim()) {
      setError('Le nom de la structure est obligatoire.');
      return;
    }

    try {
      setLoading(true); setError(''); setSuccess('');
      await API.post('/r_structure', { nom: nom.trim() });
      setSuccess('La structure a été créée avec succès ! Redirection...');
      setTimeout(() => { setCurrentView('affiliations'); }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sidebar-page-wrapper">
      
      <aside className={`sidebar-aside ${isCollapsed ? 'collapsed' : 'expanded'}`}>
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="sidebar-collapse-btn">
          {isCollapsed ? '›' : '‹'}
        </button>
        
        <button className="sidebar-nav-btn active" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
          <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🏢</span>
          {!isCollapsed && <span style={{ marginLeft: '1rem', fontSize: '0.95rem' }}>Informations générales</span>}
        </button>
      </aside>

      <section style={{ flex: 1, padding: '4rem 2rem 2rem 2rem', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '750px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {error && <div style={{ backgroundColor: 'rgba(255, 77, 77, 0.1)', color: '#ff4d4d', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', textAlign: 'left' }}>{error}</div>}
          {success && <div style={{ backgroundColor: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', padding: '0.8rem', borderRadius: '6px', fontSize: '0.9rem', fontWeight: '600', textAlign: 'left' }}>{success}</div>}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--text-main)', margin: '0 0 0.4rem 0' }}>Créer une structure</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>Initialisez votre organisation. Vous y serez rattaché en tant qu'administrateur par défaut.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={() => setCurrentView('affiliations')} className="btn-secondary">← Retour</button>
              <button type="button" onClick={handleSubmit} disabled={loading} className="btn-primary">
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>

          <div className="settings-card">
            <div className="settings-row">
              <div className="settings-row-header">
                <div className="settings-label wide">NOM DE LA STRUCTURE *</div>
                <div className="settings-value">
                  <input 
                    type="text" 
                    placeholder="Ex: Club Omnisports Élite" 
                    value={nom} 
                    onChange={(e) => setNom(e.target.value)} 
                    required
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default CreeStructure;