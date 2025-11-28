import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/uploadMiddleware';
import {
    createStory,
    getAllStories,
    getStoryById,
    updateStory,
    deleteStory,
    getMyStories,
    uploadCoverImage,
    deleteCoverImage,
    censorStory,
    uncensorStory,
    getAllStoriesAdmin
} from '../controllers/storyControllers';
import { getPagesByStoryId } from '../controllers/pageControllers';

const router = Router();

router.post('/', authMiddleware, createStory);
router.get('/my', authMiddleware, getMyStories); // Récupérer les histoires de l'utilisateur connecté
router.get('/admin/all', authMiddleware, getAllStoriesAdmin); // Admin: toutes les histoires
router.get('/', getAllStories);
router.get('/:storyId', getStoryById);
router.get('/:storyId/pages', authMiddleware, getPagesByStoryId);
router.patch('/:storyId', authMiddleware, updateStory);
router.delete('/:storyId', authMiddleware, deleteStory);

// Routes pour l'image de couverture
router.post('/:storyId/cover', authMiddleware, upload.single('coverImage'), uploadCoverImage);
router.delete('/:storyId/cover', authMiddleware, deleteCoverImage);

// Routes admin pour la censure
router.post('/:storyId/censor', authMiddleware, censorStory);
router.post('/:storyId/uncensor', authMiddleware, uncensorStory);

export default router;
