import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import {
  createPage,
  getAllPages,
  getPageById,
  updatePage,
  deletePage
} from '../controllers/pageControllers.js';

const router = Router();
router.use(authMiddleware);

router.post('/', createPage);
router.get('/', getAllPages);
router.get('/:pageId', getPageById);
router.patch('/:pageId', updatePage);
router.delete('/:pageId', roleMiddleware('admin'), deletePage);

export default router;

