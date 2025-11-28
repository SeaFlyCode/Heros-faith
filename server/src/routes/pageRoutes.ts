import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  createPage,
  getAllPages,
  getPageById,
  updatePage,
  deletePage
} from '../controllers/pageControllers';
import { getChoicesByPageId } from '../controllers/choiceControllers';

const router = Router();
router.use(authMiddleware);

router.post('/', createPage);
router.get('/', getAllPages);
router.get('/:pageId/choices', getChoicesByPageId);
router.get('/:pageId', getPageById);
router.patch('/:pageId', updatePage);
router.delete('/:pageId', deletePage);

export default router;

