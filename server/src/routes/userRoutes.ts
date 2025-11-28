import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';
import { upload } from '../middlewares/uploadMiddleware';
import {
  createUser,
  login,
  getAllUsers,
  getUserById,
  getUserStats,
  updateUser,
  deleteUser,
  uploadProfilePicture,
  deleteProfilePicture
} from '../controllers/userControllers';

const router = Router();

router.post('/login', login);
router.post('/', createUser);
router.get('/', roleMiddleware('admin'), getAllUsers);
router.get('/:userId/stats', authMiddleware, getUserStats);
router.get('/:userId', authMiddleware, getUserById);
// Route pour qu'un utilisateur puisse modifier son propre profil
router.patch('/:userId', authMiddleware, updateUser);
// Route admin pour modifier n'importe quel utilisateur
router.delete('/:userId', authMiddleware, roleMiddleware('admin'), deleteUser);

// Routes pour la photo de profil
router.post('/:userId/profile-picture', authMiddleware, upload.single('profilePicture'), uploadProfilePicture);
router.delete('/:userId/profile-picture', authMiddleware, deleteProfilePicture);

export default router;
