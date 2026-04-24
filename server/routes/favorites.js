import express from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorited
} from '../controllers/favoriteController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.get('/', authMiddleware, getFavorites);
router.get('/check', authMiddleware, isFavorited);
router.post('/', authMiddleware, addFavorite);
router.delete('/:id', authMiddleware, removeFavorite);

export default router;
