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

// Créer une story (admin uniquement)
router.post('/', createStory);

// Récupérer toutes les stories (tous utilisateurs authentifiés)
router.get('/', roleMiddleware('admin'), getAllStories);

// Récupérer une story par ID (tous utilisateurs authentifiés)
router.get('/:storyId', getStoryById);

// Mettre à jour une story (admin uniquement)
router.patch('/:storyId', roleMiddleware('admin'), updateStory);

// Supprimer une story (admin uniquement)
router.delete('/:storyId', roleMiddleware('admin'), deleteStory);

export default router;
