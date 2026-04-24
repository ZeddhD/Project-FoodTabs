import express from 'express';
import {
  createSavedOrder,
  getSavedOrders,
  getSavedOrderById,
  updateSavedOrder,
  deleteSavedOrder
} from '../controllers/savedOrderController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createSavedOrder);
router.get('/', authMiddleware, getSavedOrders);
router.get('/:id', authMiddleware, getSavedOrderById);
router.put('/:id', authMiddleware, updateSavedOrder);
router.delete('/:id', authMiddleware, deleteSavedOrder);

export default router;
