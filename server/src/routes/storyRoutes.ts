import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import {
    createStory,
    getAllStories,
    getStoryById,
    updateStory,
    deleteStory,
    getMyStories
} from '../controllers/storyControllers.ts';
import { getPagesByStoryId } from '../controllers/pageControllers.ts';

const router = Router();

router.post('/', authMiddleware, createStory);
router.get('/my', authMiddleware, getMyStories); // Récupérer les histoires de l'utilisateur connecté
router.get('/', getAllStories);
router.get('/:storyId', getStoryById);
router.get('/:storyId/pages', authMiddleware, getPagesByStoryId);
router.patch('/:storyId', authMiddleware, updateStory);
router.delete('/:storyId', authMiddleware, deleteStory); // ✅ L'auteur peut supprimer sa propre histoire

export default router;
