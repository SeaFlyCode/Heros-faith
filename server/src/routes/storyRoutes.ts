import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import { roleMiddleware } from '../middlewares/roleMiddleware.ts';
import {
    createStory,
    getAllStories,
    getStoryById,
    updateStory,
    deleteStory
} from '../controllers/storyControllers.ts';
import { getPagesByStoryId } from '../controllers/pageControllers.ts';

const router = Router();

router.post('/', authMiddleware, createStory);
router.get('/', getAllStories);
router.get('/:storyId', getStoryById);
router.get('/:storyId/pages', authMiddleware, getPagesByStoryId);
router.patch('/:storyId', authMiddleware, updateStory); // ✅ Retiré roleMiddleware('admin')
router.delete('/:storyId', authMiddleware, roleMiddleware('admin'), deleteStory);

export default router;
