import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { getStats, getAllUsers } from '../controllers/adminController';

const router = Router();

router.use(authenticate);

router.get('/stats', getStats);
router.get('/users', getAllUsers);

export default router;
