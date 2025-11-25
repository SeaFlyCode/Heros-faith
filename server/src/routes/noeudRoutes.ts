import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import { roleMiddleware } from '../middlewares/roleMiddleware.ts';
import {
  createNoeud,
  getAllNoeuds,
  getNoeudById,
  updateNoeud,
  deleteNoeud
} from '../controllers/noeudControllers.ts';

const router = Router();
router.use(authMiddleware);

router.post('/', roleMiddleware('creator'), createNoeud);
router.get('/', getAllNoeuds);
router.get('/:noeudId', getNoeudById);
router.patch('/:noeudId', roleMiddleware('creator'), updateNoeud);
router.delete('/:noeudId', roleMiddleware('creator'), deleteNoeud);

export default router;

