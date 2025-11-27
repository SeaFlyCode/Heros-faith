import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { errorHandler } from './middlewares/errorHandler';
import { connectDB } from './config/database';
import dotenv from 'dotenv';

// Import des routes
import userRoutes from './routes/userRoutes';
import storyRoutes from './routes/storyRoutes';
import pageRoutes from './routes/pageRoutes';
import choiceRoutes from './routes/choiceRoutes';
import partyRoutes from './routes/partyRoutes';
import ratingRoutes from './routes/ratingRoutes';
import reportRoutes from './routes/reportRoutes';

dotenv.config();

console.log('🚀 [Server] Démarrage du serveur...');
console.log('🔧 [Server] NODE_ENV:', process.env.NODE_ENV || 'development');
console.log('🔧 [Server] PORT:', process.env.PORT || 3000);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration CORS pour autoriser les requêtes depuis le frontend
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    'http://127.0.0.1:3001',
    'https://heros-faith.matheovieilleville.fr',
    'http://heros-faith.matheovieilleville.fr'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Vérifier et créer le dossier uploads
const uploadsPath = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
console.log('📁 [Server] Chemin du dossier uploads:', uploadsPath);

if (!fs.existsSync(uploadsPath)) {
  console.log('📁 [Server] Création du dossier uploads...');
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log('✅ [Server] Dossier uploads créé');
} else {
  console.log('✅ [Server] Dossier uploads existe');
  // Lister les fichiers dans uploads
  try {
    const files = fs.readdirSync(uploadsPath);
    console.log(`📁 [Server] Fichiers dans uploads (${files.length}):`, files.slice(0, 5));
  } catch (err) {
    console.log('❌ [Server] Erreur lors de la lecture du dossier uploads:', err);
  }
}

// Servir les fichiers statiques (uploads) avec en-têtes CORS
app.use('/uploads', (req, res, next) => {
  console.log('📸 [Server] Requête d\'image:', {
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
    fullPath: path.join(uploadsPath, req.path),
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
}, express.static(uploadsPath));

// Servir les uploads également sur /api/uploads pour compatibilité
app.use('/api/uploads', (req, res, next) => {
  console.log('📸 [Server] Requête d\'image via /api/uploads:', {
    path: req.path,
    method: req.method,
    origin: req.headers.origin,
    fullPath: path.join(uploadsPath, req.path),
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
}, express.static(uploadsPath));

app.get('/', (req, res) => {
    res.send('Serveur Express TypeScript opérationnel !');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/choices', choiceRoutes);
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

(async () => {
    await startServer();

    app.listen(PORT, () => {
        console.log(`Serveur démarré sur le port ${PORT}`);
    });
})();
