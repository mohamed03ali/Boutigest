// src/routes/utilisateurs.js
import express from 'express';
import { verifierToken } from '../middleware/auth.js';
import { lister, creer, supprimer, changerMotDePasse } from '../controllers/utilisateursController.js';

const router = express.Router();
router.use(verifierToken);
router.get('/', lister);
router.post('/', creer);
router.patch('/:id/mot-de-passe', changerMotDePasse);
router.delete('/:id', supprimer);

export default router;