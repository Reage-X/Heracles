import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Ajout du token à chaque requête
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur de réponse pour la déconnexion forcée en cas de token expiré
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn("⚠️ Token invalide ou expiré. Déconnexion forcée.");
      
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      window.location.href = '/'; 
    }
    return Promise.reject(error);
  }
);

export default API;