import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import { roleMiddleware } from '../middlewares/roleMiddleware.ts';
import {
  createUser,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userControllers.ts';

const router = Router();

router.post('/login', login);
router.post('/', createUser);
router.get('/', roleMiddleware('admin'), getAllUsers);
router.get('/:userId', authMiddleware, getUserById);
router.patch('/:userId', authMiddleware, roleMiddleware('admin'), updateUser);
router.delete('/:userId', authMiddleware, roleMiddleware('admin'), deleteUser);

export default router;
