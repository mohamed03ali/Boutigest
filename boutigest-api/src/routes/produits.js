import express from 'express';
import { verifierToken } from '../middleware/auth.js';
import { lister, creer, modifier, supprimer } from '../controllers/produitsController.js';

const router = express.Router();
router.use(verifierToken);

router.get('/', lister);
router.post('/', creer);
router.put('/:id', modifier);
router.delete('/:id', supprimer);

export default router;
