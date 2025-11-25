import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import {
  createNoeud,
  getAllNoeuds,
  getNoeudById,
  updateNoeud,
  deleteNoeud
} from '../controllers/noeudControllers.js';

const router = Router();
router.use(authMiddleware);

router.post('/', createNoeud);
router.get('/', getAllNoeuds);
router.get('/:noeudId', getNoeudById);
router.patch('/:noeudId', updateNoeud);
router.delete('/:noeudId', roleMiddleware('admin'), deleteNoeud);

export default router;

