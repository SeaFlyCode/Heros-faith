import multer from 'multer';
import path from 'path';
import fs from 'fs';


// Créer le dossier uploads s'il n'existe pas
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
console.log('📁 [Upload] Dossier d\'uploads configuré:', uploadsDir);

if (!fs.existsSync(uploadsDir)) {
  console.log('📁 [Upload] Création du dossier uploads...');
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ [Upload] Dossier créé avec succès');
} else {
  console.log('✅ [Upload] Dossier uploads existe déjà');
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    console.log('📁 [Upload] Destination du fichier:', uploadsDir);
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    // Générer un nom unique pour le fichier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'profilePicture' ? 'profile' : 'story';
    const filename = `${prefix}-${uniqueSuffix}${ext}`;
    console.log('📝 [Upload] Nom du fichier généré:', filename);
    console.log('📝 [Upload] Type de fichier:', file.mimetype);
    console.log('📝 [Upload] Nom original:', file.originalname);
    cb(null, filename);
  }
});

// Filtre pour n'accepter que les images
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  console.log('🔍 [Upload] Vérification du type de fichier:', file.mimetype);

  if (allowedTypes.includes(file.mimetype)) {
    console.log('✅ [Upload] Type de fichier accepté');
    cb(null, true);
  } else {
    console.log('❌ [Upload] Type de fichier refusé:', file.mimetype);
    cb(new Error('Type de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.'));
  }
};

// Configuration de multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  }
});

export const uploadsPath = uploadsDir;
