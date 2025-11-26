import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import { roleMiddleware } from '../middlewares/roleMiddleware.ts';
import {
  createRating,
  getAllRatings,
  getRatingById,
  updateRating,
  deleteRating
} from '../controllers/ratingControllers.ts';

const router = Router();
router.use(authMiddleware);

router.post('/', roleMiddleware('user'), createRating);
router.get('/', getAllRatings);
router.get('/:ratingId', getRatingById);
router.patch('/:ratingId', roleMiddleware('user'), updateRating);
router.delete('/:ratingId', roleMiddleware('user'), deleteRating);

export default router;

