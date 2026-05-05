import express from 'express';
import { chat } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat — no auth required (chatbot is public)
router.post('/', chat);

export default router;
