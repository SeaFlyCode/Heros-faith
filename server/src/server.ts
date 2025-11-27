import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middlewares/errorHandler.ts';
import { connectDB } from './config/database.ts';
import dotenv from 'dotenv';

// Import des routes
import userRoutes from './routes/userRoutes.ts';
import storyRoutes from './routes/storyRoutes.ts';
import pageRoutes from './routes/pageRoutes.ts';
import choiceRoutes from './routes/choiceRoutes.ts';
import noeudRoutes from './routes/noeudRoutes.ts';
import partyRoutes from './routes/partyRoutes.ts';
import ratingRoutes from './routes/ratingRoutes.ts';
import reportRoutes from './routes/reportRoutes.ts';

dotenv.config();

// Obtenir __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS pour autoriser les requêtes depuis le frontend
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Servir les fichiers statiques (uploads) avec en-têtes CORS
app.use('/uploads', (req, res, next) => {
  console.log('📸 [Server] Requête d\'image:', {
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });

  // En-têtes CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');

  // Définir le bon type MIME selon l'extension
  const ext = path.extname(req.path).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };

  if (mimeTypes[ext]) {
    res.setHeader('Content-Type', mimeTypes[ext]);
  }

  next();
}, express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
    res.send('Serveur Express TypeScript opérationnel !');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/choices', choiceRoutes);
app.use('/api/noeuds', noeudRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/reports', reportRoutes);

app.use(errorHandler);

async function startServer() {
    try {
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
