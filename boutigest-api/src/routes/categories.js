// src/routes/categories.js
import express from 'express';
import { verifierToken } from '../middleware/auth.js';
import { lister, creer } from '../controllers/categoriesController.js';

const router = express.Router();
router.use(verifierToken);
router.get('/', lister);
router.post('/', creer);

export default router;