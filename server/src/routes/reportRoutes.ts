import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.ts';
import { roleMiddleware } from '../middlewares/roleMiddleware.ts';
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport
} from '../controllers/reportControllers.ts';

const router = Router();
router.use(authMiddleware);

router.post('/', roleMiddleware('user'), createReport);
router.get('/', roleMiddleware('admin'), getAllReports);
router.get('/:reportId', roleMiddleware('admin'), getReportById);
router.patch('/:reportId', roleMiddleware('admin'), updateReport);
router.delete('/:reportId', roleMiddleware('admin'), deleteReport);

export default router;

