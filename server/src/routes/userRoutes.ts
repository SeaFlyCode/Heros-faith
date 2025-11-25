import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} from '../controllers/userControllers.js';

const router = Router();
router.use(authMiddleware);

router.post('/', roleMiddleware('admin'), createUser);
router.get('/', roleMiddleware('admin'), getAllUsers);
router.get('/:userId', getUserById);
router.patch('/:userId', roleMiddleware('admin'), updateUser);
router.delete('/:userId', roleMiddleware('admin'), deleteUser);

export default router;
