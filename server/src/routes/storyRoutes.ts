import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
    createStory,
    getStories,
    getStoryById,
    updateStory,
    deleteStory
} from '../controllers/storyControllers';

const router = Router();

router.use(authMiddleware); // Toutes les routes sont protégées

// Créer une story
router.post('/', createStory);

// Récupérer toutes les stories
router.get('/', getStories);

// Récupérer une story par ID
router.get('/:storyId', getStoryById);

// Mettre à jour une story
router.patch('/:storyId', updateStory);

// Supprimer une story
router.delete('/:storyId', deleteStory);

export default router;

