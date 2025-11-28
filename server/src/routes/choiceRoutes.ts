import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createChoice,
  getAllChoices,
  getChoiceById,
  updateChoice,
  deleteChoice
} from '../controllers/choiceControllers';

const router = Router();
router.use(authMiddleware);

router.post('/', createChoice);
router.get('/', getAllChoices);
router.get('/:choiceId', getChoiceById);
router.patch('/:choiceId', updateChoice);
router.delete('/:choiceId', deleteChoice);

export default router;

