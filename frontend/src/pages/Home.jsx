import React from 'react';

const Home = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      textAlign: 'center',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '800',
        color: 'var(--text-main)',
        marginBottom: '1rem',
        letterSpacing: '-0.5px'
      }}>
        Bienvenue sur <span style={{ color: 'var(--accent-blue)' }}>HERACLES</span>
      </h1>
      
      <p style={{
        fontSize: '1.1rem',
        color: 'var(--text-muted)',
        lineHeight: '1.6',
        marginBottom: '1rem'
      }}>
          Heracles est une plateforme d'analyse et de suivi de progression sur-mesure conçue pour interconnecter les structures sportives, les coachs et les athlètes. Grâce à un système de fiches de performance hautement personnalisables, chaque encadrant peut définir ses propres grilles d'évaluation (métriques numériques, échelles de valeurs ou suivis textuels). 
      </p>

      <p style={{
        fontSize: '1.1rem',
        color: 'var(--text-muted)',
        lineHeight: '1.6',
        marginBottom: '1rem'
      }}>
        Notre moteur d'agrégation NoSQL génère automatiquement des analyses statistiques et des bilans d'évolution graphiques en temps réel. Complété par un système de messagerie ciblé par équipe, Heracles centralise les échanges et transforme les données brutes de vos entraînements en véritables leviers de réussite.
      </p>
    </div>
  );
};

export default Home;