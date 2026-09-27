// src/routes/notifications.js
import express from 'express';
import { verifierToken } from '../middleware/auth.js';
import { lister, marquerLue } from '../controllers/notificationsController.js';

const router = express.Router();
router.use(verifierToken);
router.get('/', lister);
router.patch('/:id/lue', marquerLue);

export default router;