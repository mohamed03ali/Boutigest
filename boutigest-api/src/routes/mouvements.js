// src/routes/mouvements.js
import express from 'express';
import { verifierToken } from '../middleware/auth.js';
import { lister, ajusterInventaire } from '../controllers/mouvementsController.js';

const router = express.Router();
router.use(verifierToken);
router.get('/', lister);
router.post('/ajuster-inventaire', ajusterInventaire);

export default router;