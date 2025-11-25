import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import {
  createRating,
  getAllRatings,
  getRatingById,
  updateRating,
  deleteRating
} from '../controllers/ratingControllers.js';

const router = Router();
router.use(authMiddleware);

router.post('/', createRating);
router.get('/', getAllRatings);
router.get('/:ratingId', getRatingById);
router.patch('/:ratingId', updateRating);
router.delete('/:ratingId', roleMiddleware('admin'), deleteRating);

export default router;

