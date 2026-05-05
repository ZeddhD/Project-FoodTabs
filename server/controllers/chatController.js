// Thin controller — all keyword matching lives in chatbotService.js
import { detectIntent } from '../services/chatbotService.js';
import { sendResponse, sendError } from '../utils/helpers.js';

/**
 * POST /api/chat
 * Body: { message: string }
 * Returns: { reply: string }
 */
export const chat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return sendError(res, 400, 'message is required');
    }

    const reply = await detectIntent(message.trim());
    sendResponse(res, 200, true, 'Chat response', { reply });
  } catch (error) {
    next(error);
  }
};
