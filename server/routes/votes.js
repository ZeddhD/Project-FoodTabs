import express from 'express';
import { castVote, getVotes, getUserVote } from '../controllers/voteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/votes — { parentId, parentType, value: 1|-1 }
router.post('/',           protect, castVote);
router.get('/',            getVotes);
router.get('/user-vote',   protect, getUserVote);

export default router;
