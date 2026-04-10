import express from 'express';
import { createVote, getVotes } from '../controllers/voteController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createVote);
router.get('/', getVotes);

export default router;
