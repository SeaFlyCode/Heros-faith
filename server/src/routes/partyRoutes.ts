import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import { roleMiddleware } from '../middlewares/roleMiddleware.ts';
import {
  createParty,
  getAllParties,
  getPartyById,
  getPartiesByUserId,
  getPartyByUserAndStory,
  getPartyProgress,
  updateParty,
  deleteParty
} from '../controllers/partyControllers.ts';

const router = Router();
router.use(authMiddleware);

router.post('/', roleMiddleware('user'), createParty);
router.get('/', getAllParties);
router.get('/user/:userId', getPartiesByUserId);
router.get('/user/:userId/story/:storyId', getPartyByUserAndStory);
router.get('/:partyId', getPartyById);
router.get('/:partyId/progress', getPartyProgress);
router.patch('/:partyId', roleMiddleware('user'), updateParty);
router.delete('/:partyId', roleMiddleware('user'), deleteParty);

export default router;

