import express from 'express';
import { errorHandler } from './middlewares/errorHandler.ts';
import { connectDB } from './config/database.ts';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Serveur Express TypeScript opérationnel !');
});

app.use(errorHandler);

async function startServer() {
    try {
        // Initialisation de la connexion à la base de données ou autres services
        console.log('Initialisation des services...');
        await connectDB();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation des services :', error);
        process.exit(1);
    }

}

await startServer();

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
