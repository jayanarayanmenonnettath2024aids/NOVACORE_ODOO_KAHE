import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { 
  getDashboardData, 
  createManifestGoal, 
  updateManifestGoal 
} from '../controllers/dashboardController';

const router = Router();

router.use(authenticate);
router.get('/', getDashboardData);
router.post('/manifest', createManifestGoal);
router.put('/manifest/:id', updateManifestGoal);

export default router;
