import express from 'express';
import { verifierToken } from '../middleware/auth.js';
import { lister, creer, modifier } from '../controllers/clientsController.js';

const router = express.Router();
router.use(verifierToken);

router.get('/', lister);
router.post('/', creer);
router.put('/:id', modifier);

export default router;
