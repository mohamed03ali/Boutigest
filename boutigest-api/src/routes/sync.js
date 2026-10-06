import express from 'express';
import { verifierToken } from '../middleware/auth.js';
import { push,pull} from '../controllers/syncController.js';

const router = express.Router();
router.use(verifierToken);

router.post('/push', push);
router.get('/pull', pull);
export default router;