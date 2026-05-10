import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { getAIReasoning } from '../controllers/aiController';

const router = Router();

router.use(authenticate);
router.get('/reasoning', getAIReasoning);

export default router;
