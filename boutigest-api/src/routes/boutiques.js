import express from 'express';
import { verifierToken } from '../middleware/auth.js';
import { creer, obtenir } from '../controllers/boutiquesController.js';

const router = express.Router();
router.use(verifierToken);

router.post('/', creer);
router.get('/', obtenir);

export default router;
