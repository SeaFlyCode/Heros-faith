import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import {
  createParty,
  getAllParties,
  getPartyById,
  updateParty,
  deleteParty
} from '../controllers/partyControllers.js';

const router = Router();
router.use(authMiddleware);

router.post('/', createParty);
router.get('/', getAllParties);
router.get('/:partyId', getPartyById);
router.patch('/:partyId', updateParty);
router.delete('/:partyId', roleMiddleware('admin'), deleteParty);

export default router;

