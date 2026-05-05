import express from 'express';
import { 
  createReport, 
  getReports, 
  getReportById, 
  updateReport 
} from '../controllers/reportController.js';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

const router = express.Router();

// User creates report
router.post('/', authMiddleware, createReport);

// Admin gets all reports
router.get('/', authMiddleware, roleMiddleware('admin'), getReports);
router.get('/:id', authMiddleware, roleMiddleware('admin'), getReportById);

// Admin updates report and takes action
router.patch('/:id', authMiddleware, roleMiddleware('admin'), updateReport);

export default router;
