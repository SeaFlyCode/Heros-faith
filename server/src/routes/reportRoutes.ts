import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport
} from '../controllers/reportControllers.js';

const router = Router();
router.use(authMiddleware);

router.post('/', createReport);
router.get('/', roleMiddleware('admin'), getAllReports);
router.get('/:reportId', getReportById);
router.patch('/:reportId', roleMiddleware('admin'), updateReport);
router.delete('/:reportId', roleMiddleware('admin'), deleteReport);

export default router;

