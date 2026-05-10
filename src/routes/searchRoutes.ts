import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { searchCities, searchActivities } from '../controllers/searchController';

const router = Router();

router.use(authenticate);

router.get('/cities', searchCities);
router.get('/activities', searchActivities);

export default router;
