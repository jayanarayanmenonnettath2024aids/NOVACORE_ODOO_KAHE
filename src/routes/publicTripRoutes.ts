import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { getPublicTrip, copyTrip } from '../controllers/publicTripController';

const router = Router();

router.get('/:id', getPublicTrip);
router.post('/:id/copy', authenticate, copyTrip); // Requires login to copy

export default router;
