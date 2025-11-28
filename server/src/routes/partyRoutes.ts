import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createParty,
  getAllParties,
  getPartyById,
  getPartiesByUserId,
  getPartyByUserAndStory,
  getPartyProgress,
  updateParty,
  deleteParty
} from '../controllers/partyControllers';

const router = Router();
router.use(authMiddleware);

router.post('/', createParty); // Admins et users peuvent créer des parties
router.get('/', getAllParties);
router.get('/user/:userId', getPartiesByUserId);
router.get('/user/:userId/story/:storyId', getPartyByUserAndStory);
router.get('/:partyId', getPartyById);
router.get('/:partyId/progress', getPartyProgress);
router.patch('/:partyId', updateParty); // Admins et users peuvent mettre à jour leurs parties
router.delete('/:partyId', deleteParty); // Admins et users peuvent supprimer leurs parties

export default router;

