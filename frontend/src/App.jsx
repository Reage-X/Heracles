import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Affiliations from './pages/Affiliations.jsx';
import CreeStructure from './pages/CreeStructure.jsx';
import CreeEquipe from './pages/CreeEquipe.jsx';
import ManageStructure from './pages/ManageStructure.jsx';
import ManageEquipe from './pages/ManageEquipe.jsx';
import Discussion from './pages/Discussion.jsx';
import API from './services/api';

function App() {
  const [theme, setTheme] = useState('light');
  const [currentView, setCurrentView] = useState('home');
  const [isConnected, setIsConnected] = useState(false);
  const [emailForActivation, setEmailForActivation] = useState('');
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [selectedEquipe, setSelectedEquipe] = useState(null);
  const [pseudo, setPseudo] = useState('');

  const fetchNavbarProfile = async () => {
    try {
      const response = await API.get('/r_utilisateur/profil');
      setPseudo(response.data.pseudo || '');
    } catch (error) {
      console.error("Erreur lors de la récupération du pseudo pour la Navbar", error);
    }
  };

  // Fonction pour basculer le thème (moule attendu par la Navbar)
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Fonction de déconnexion propre (manquante à l'appel historiquement)
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setIsConnected(false);
    setPseudo('');
    setCurrentView('home');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      setIsConnected(true);
      fetchNavbarProfile();
    }
  }, [isConnected]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)' }}>
      {/* Raccordement des props avec les fonctions internes correspondantes */}
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        isConnected={isConnected} 
        setCurrentView={setCurrentView} 
        handleLogout={handleLogout} 
        pseudo={pseudo}
      />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', width: '100%', boxSizing: 'border-box', paddingTop: 'clamp(2rem, 6vh, 5rem)' }}>
        {currentView === 'home' && <Home />}
        {currentView === 'profile' && <Profile />}
        {currentView === 'affiliations' && (
          <Affiliations 
            setCurrentView={setCurrentView} 
            setSelectedStructure={setSelectedStructure} 
            setSelectedEquipe={setSelectedEquipe}
          />
        )}
        {currentView === 'create-structure' && <CreeStructure setCurrentView={setCurrentView} />}
        {currentView === 'create-equipe' && (
          <CreeEquipe 
            setCurrentView={setCurrentView} 
            structure={selectedStructure} 
            setSelectedEquipe={setSelectedEquipe} 
          />
        )}
        {currentView === 'manage-structure' && (
          <ManageStructure 
            setCurrentView={setCurrentView} 
            structure={selectedStructure} 
            setSelectedEquipe={setSelectedEquipe} 
          />
        )}
        {currentView === 'manage-equipe' && (
          <ManageEquipe 
            setCurrentView={setCurrentView} 
            equipe={selectedEquipe} 
            setSelectedStructure={setSelectedStructure} 
          />
        )}
        {currentView === 'login' && <Login setCurrentView={setCurrentView} setIsConnected={setIsConnected} setEmailForActivation={setEmailForActivation} />}
        {currentView === 'register' && <Register setCurrentView={setCurrentView} emailForActivation={emailForActivation} setEmailForActivation={setEmailForActivation} />}
        {currentView === 'discussion' && <Discussion />}
      </main>
    </div>
  );
}

export default App;