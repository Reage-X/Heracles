import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

import connectDB from './config/db.js';
import mainRouter from './routes/r_index.js';

connectDB();
const app = express();

app.use(helmet());

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());

app.use('/api', mainRouter);

app.get('/', (req, res) => {
    res.send("API NoSQL Heracles opérationnelle");
});

// Gestion des routes non trouvées (404)
app.use((req, res) => {
    res.status(404).json({
        error: 'Route non trouvée',
        path: req.path,
        method: req.method
    });
});

// Gestion globale des erreurs système (500)
app.use((err, req, res, next) => {
    console.error('Erreur Système détectée :', err.stack);
    res.status(500).json({
        error: 'Erreur interne du serveur',
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`========= SERVEUR LANCÉ SUR : http://localhost:${PORT} =========`);
});