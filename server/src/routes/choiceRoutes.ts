import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import {
  createChoice,
  getAllChoices,
  getChoiceById,
  updateChoice,
  deleteChoice
} from '../controllers/choiceControllers.js';

const router = Router();
router.use(authMiddleware);

router.post('/', createChoice);
router.get('/', getAllChoices);
router.get('/:choiceId', getChoiceById);
router.patch('/:choiceId', updateChoice);
router.delete('/:choiceId', roleMiddleware('admin'), deleteChoice);

export default router;

