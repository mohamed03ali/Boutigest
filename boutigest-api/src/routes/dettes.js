// src/routes/dettes.js
import express from 'express';
import { verifierToken } from '../middleware/auth.js';
import { lister, marquerReglee } from '../controllers/dettesController.js';

const router = express.Router();
router.use(verifierToken);
router.get('/', lister);
router.patch('/:id/regler', marquerReglee);

export default router;