import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import API from '../services/api';

const Discussion = () => {
  const [discussions, setDiscussions] = useState([]);
  const [activeDiscussion, setActiveDiscussion] = useState(null);
  const [searchCanal, setSearchCanal] = useState('');
  
  const [messages, setMessages] = useState([]);
  const [nouveauMessage, setNouveauMessage] = useState('');
  const [totalMessages, setTotalMessages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  
  const chatContainerRef = useRef(null);
  const scrollSnapshotRef = useRef(null);

  useEffect(() => {
    fetchListeDiscussions();
  }, []);

  useEffect(() => {
    if (activeDiscussion) {
      setCurrentPage(1);
      fetchMessagesFils(activeDiscussion.id || activeDiscussion._id, 1, false);
    }
  }, [activeDiscussion]);

  useLayoutEffect(() => {
    if (chatContainerRef.current) {
      if (scrollSnapshotRef.current !== null) {
        const conteneur = chatContainerRef.current;
        conteneur.scrollTop = conteneur.scrollHeight - scrollSnapshotRef.current;
        scrollSnapshotRef.current = null;
      } else if (currentPage === 1) {
        const conteneur = chatContainerRef.current;
        conteneur.scrollTop = conteneur.scrollHeight;
      }
    }
  }, [messages]);

  const fetchListeDiscussions = async () => {
    try {
      setLoadingList(true);
      const response = await API.get('/r_discussion/mes-discussions');
      setDiscussions(response.data || []);
      if (response.data && response.data.length > 0) {
        setActiveDiscussion(response.data[0]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des canaux de discussion.");
    } finally {
      setLoadingList(false);
    }
  };

  const fetchMessagesFils = async (discussionId, pageTarget, appendOlder = false) => {
    try {
      if (appendOlder) {
        setLoadingOlder(true);
        if (chatContainerRef.current) {
          const conteneur = chatContainerRef.current;
          scrollSnapshotRef.current = conteneur.scrollHeight - conteneur.scrollTop;
        }
      } else {
        setLoadingMessages(true);
      }

      const response = await API.get(`/r_discussion/${discussionId}?page=${pageTarget}&limit=50`);
      const nouveauxMessages = response.data.discussion?.messages || [];
      
      setTotalMessages(response.data.totalMessages || 0);

      if (appendOlder) {
        setMessages((prev) => [...nouveauxMessages, ...prev]);
      } else {
        setMessages(nouveauxMessages);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des messages.");
    } finally {
      setLoadingMessages(false);
      setLoadingOlder(false);
    }
  };

  const handleLoadOlderMessages = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchMessagesFils(activeDiscussion.id || activeDiscussion._id, nextPage, true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!nouveauMessage.trim() || !activeDiscussion) return;

    try {
      const discussionId = activeDiscussion.id || activeDiscussion._id;
      const response = await API.post(`/r_discussion/${discussionId}/messages`, {
        contenu: nouveauMessage.trim()
      });
      setMessages((prev) => [...prev, response.data]);
      setNouveauMessage('');
      setTotalMessages((prev) => prev + 1);
    } catch (error) {
      console.error("Impossible d'envoyer le message.");
    }
  };

  const formatCanalTitre = (disc) => {
    if (disc.typeFil === 'general') {
      return `💬 canal-general (${disc.equipeId?.nom || 'Équipe'})`;
    }
    if (disc.typeFil === 'entrainement' && disc.joueurId) {
      return `🏃 suivi-${disc.joueurId.pseudo} (${disc.equipeId?.nom || 'Équipe'})`;
    }
    return `📝 fil-discussion (${disc.equipeId?.nom || 'Équipe'})`;
  };

  const filteredDiscussions = discussions.filter(disc => {
    const titre = formatCanalTitre(disc).toLowerCase();
    return titre.includes(searchCanal.toLowerCase());
  });

  const aDesMessagesPrecedents = messages.length < totalMessages;

  return (
    <div className="sidebar-page-wrapper" style={{ borderTop: '1px solid var(--border-color)' }}>
      <aside className="sidebar-aside expanded">
        
        <div style={{ padding: '0 1rem 0.5rem 1rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
          CANAUX DE DISCUSSION
        </div>

        <div style={{ padding: '0 1rem 1rem 1rem' }}>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchCanal}
            onChange={(e) => setSearchCanal(e.target.value)}
            className="form-input"
            style={{ padding: '0.5rem', fontSize: '0.85rem' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '100%', overflowY: 'auto', flex: 1 }}>
          {loadingList ? (
            <p style={{ padding: '0 1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Chargement...</p>
          ) : filteredDiscussions.length === 0 ? (
            <p style={{ padding: '0 1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Aucun canal trouvé.</p>
          ) : (
            filteredDiscussions.map((disc) => {
              const discId = disc.id || disc._id;
              const estActif = (activeDiscussion?.id || activeDiscussion?._id) === discId;
              
              return (
                <button
                  key={discId}
                  onClick={() => setActiveDiscussion(disc)}
                  className={`sidebar-nav-btn ${estActif ? 'active' : ''}`}
                  title={formatCanalTitre(disc)}
                >
                  <span style={{ fontSize: '1.1rem', minWidth: '24px', textAlign: 'center' }}>
                    {disc.typeFil === 'general' ? '#' : '👤'}
                  </span>
                  <span style={{ marginLeft: '0.75rem', fontSize: '0.85rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {disc.typeFil === 'general' ? disc.equipeId?.nom : `${disc.joueurId?.prenom} ${disc.joueurId?.nom}`}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      <section style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)', position: 'relative' }}>
        
        <div style={{ height: '3.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 1.5rem', boxSizing: 'border-box', width: '100%' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {activeDiscussion ? formatCanalTitre(activeDiscussion) : "Espace de discussion"}
          </h3>
        </div>

        {activeDiscussion ? (
          <>
            <div 
              ref={chatContainerRef}
              style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxSizing: 'border-box' }}
            >
              {aDesMessagesPrecedents && (
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={handleLoadOlderMessages} 
                    disabled={loadingOlder}
                    className="btn-secondary"
                    style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
                  >
                    {loadingOlder ? "Chargement..." : "Charger la conversation"}
                  </button>
                </div>
              )}

              {loadingMessages ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Chargement des messages...</p>
              ) : messages.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 'auto', marginBottom: 'auto' }}>
                  Le fil est vierge. Envoyez un message pour démarrer la discussion.
                </p>
              ) : (
                messages.map((msg, index) => {
                  const expediteurNom = msg.expediteurId ? `${msg.expediteurId.prenom} ${msg.expediteurId.nom}` : "Ancien membre";
                  return (
                    <div key={msg._id || index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', padding: '0.25rem 0' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.15rem' }}>
                        <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                          {expediteurNom}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {new Date(msg.dateEnvoi).toLocaleString()}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                        {msg.contenu}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ padding: '1rem 1.5rem 1.5rem 1.5rem', boxSizing: 'border-box' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', width: '100%' }}>
                <input
                  type="text"
                  placeholder={`Écrire dans le canal...`}
                  value={nouveauMessage}
                  onChange={(e) => setNouveauMessage(e.target.value)}
                  className="form-input"
                  style={{ borderRadius: '6px 0 0 6px' }}
                />
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{ borderRadius: '0 6px 6px 0', padding: '0 1.5rem' }}
                >
                  Envoyer
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sélectionnez ou rejoignez une équipe pour ouvrir un espace de discussion.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Discussion;
