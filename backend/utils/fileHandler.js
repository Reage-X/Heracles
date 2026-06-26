import fs from 'fs';
import path from 'path';

export const saveStatsToJson = (data) => {
    try {
        const dir = './data';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const filePath = path.join(process.cwd(), 'data', 'top_events.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        
        console.log(`Statistiques exportées avec succès dans : ${filePath}`);
        return filePath;
    } catch (error) {
        console.error("Erreur lors de l'écriture du fichier JSON :", error.message);
        throw error;
    }
};

export const readInitialData = (fileName) => {
    try {
        const filePath = path.join(process.cwd(), 'data', fileName);
        if (fs.existsSync(filePath)) {
            const rawData = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(rawData);
        }
        return null;
    } catch (error) {
        console.error("Erreur lors de la lecture du fichier JSON :", error.message);
        return null;
    }
};