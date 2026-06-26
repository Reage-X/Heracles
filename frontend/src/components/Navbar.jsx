import React, { useState } from 'react';

const Navbar = ({ theme, toggleTheme, isConnected = false, setCurrentView, handleLogout, pseudo }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 5vw',
      height: '4.4rem',
      backgroundColor: 'var(--bg-navbar)',
      borderBottom: '1px solid var(--border-color)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <button className="nav-brand-btn" onClick={() => setCurrentView('home')}>
          HERACLES
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {isConnected && (
            <>
              <button className="nav-hover-btn" onClick={() => setCurrentView('affiliations')}>
                Mes affiliations
              </button>
              <button className="nav-hover-btn" onClick={() => setCurrentView('discussion')}>
                Discussions
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        
        {!isConnected && (
          <button className="nav-hover-btn" onClick={() => setCurrentView('login')} style={{ fontWeight: '600' }}>
            Connexion
          </button>
        )}

        {isConnected && pseudo && (
          <span style={{
            color: 'var(--text-main)',
            fontWeight: '600',
            fontSize: '0.95rem',
            marginRight: '0.2rem',
            userSelect: 'none',
            letterSpacing: '0.3px'
          }}>
            {pseudo}
          </span>
        )}

        <div className="avatar-container">
          <div className="avatar-click-zone" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              {isConnected && (
                <button className="dropdown-item" onClick={() => { setCurrentView('profile'); setIsDropdownOpen(false); }}>
                  👤 Gestion profil
                </button>
              )}

              <button className="dropdown-item" onClick={toggleTheme}>
                {theme === 'light' ? '🌙 Mode Sombre' : '☀️ Mode Clair'}
              </button>

              {isConnected && (
                <button className="dropdown-item logout-btn" onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}>
                  ⎋ Déconnexion
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;