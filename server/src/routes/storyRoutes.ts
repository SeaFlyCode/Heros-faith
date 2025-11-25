import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import {
    createStory,
    getAllStories,
    getStoryById,
    updateStory,
    deleteStory
} from '../controllers/storyControllers.js';

const router = Router();

router.use(authMiddleware); // Toutes les routes sont protégées

router.post('/', createStory);
router.get('/', roleMiddleware('admin'), getAllStories);
router.get('/:storyId', getStoryById);
router.patch('/:storyId', roleMiddleware('admin'), updateStory);
router.delete('/:storyId', roleMiddleware('admin'), deleteStory);

export default router;
