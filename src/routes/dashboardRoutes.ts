import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { getDashboardData } from '../controllers/dashboardController';

const router = Router();

router.use(authenticate);
router.get('/', getDashboardData);

export default router;
