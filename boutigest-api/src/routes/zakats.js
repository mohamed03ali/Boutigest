// src/routes/zakats.js
import express from 'express';
import { verifierToken } from '../middleware/auth.js';
import { lister, creer, marquerPaye } from '../controllers/zakatsController.js';

const router = express.Router();
router.use(verifierToken);
router.get('/', lister);
router.post('/', creer);
router.patch('/:id/payer', marquerPaye);

export default router;