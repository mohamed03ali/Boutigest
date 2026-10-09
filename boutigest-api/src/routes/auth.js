// src/routes/auth.js
import express from 'express';
import { limiteurAuth } from '../middleware/rateLimiter.js';
import { verifierToken } from '../middleware/auth.js';
import { register, login, moi } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', limiteurAuth, register);
router.post('/login', limiteurAuth, login);
router.get('/moi', verifierToken, moi);

export default router;