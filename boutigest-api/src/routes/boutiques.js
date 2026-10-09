import { Router } from 'express';
import { creer, lister, definirActive } from '../controllers/boutiquesController.js';
import { verifierToken } from '../middleware/auth.js'; // adapte au nom réel chez toi

const router = Router();

router.post('/', verifierToken, creer);
router.get('/', verifierToken, lister);           // avant: obtenir
router.patch('/active', verifierToken, definirActive); // nouvelle route

export default router;