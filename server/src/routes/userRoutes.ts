import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import { roleMiddleware } from '../middlewares/roleMiddleware.ts';
import {
  createUser,
  login,
  getAllUsers,
  getUserById,
  getUserStats,
  updateUser,
  deleteUser
} from '../controllers/userControllers.ts';

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

export default router;
