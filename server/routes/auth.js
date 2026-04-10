import express from 'express';
import { register, login, logout, getProfile, updateProfile } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../utils/validators.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, updateProfile);

export default router;
