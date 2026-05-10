import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import { createTripSchema, addStopSchema, addActivitySchema } from '../utils/validators';
import { 
  createTrip, 
  getTrips, 
  getTripById, 
  updateTrip, 
  deleteTrip,
  addStop,
  addActivity,
  getBudget,
  addPackingItem,
  togglePackingItem,
  deletePackingItem,
  resetPackingItems,
  getPublicTrip,
  cloneTrip
} from '../controllers/tripController';

const router = Router();

// Public routes (No Auth)
router.get('/public/:id', getPublicTrip);

// Protect all following routes
router.use(authenticate);

router.post('/', validateRequest(createTripSchema), createTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/clone', cloneTrip);

// Stops & Activities
router.post('/:tripId/stops', validateRequest(addStopSchema), addStop);
router.post('/stops/:stopId/activities', validateRequest(addActivitySchema), addActivity);

// Budget & Packing
router.get('/:tripId/budget', getBudget);
router.post('/:tripId/packing', addPackingItem);
router.put('/packing/:itemId', togglePackingItem);
router.delete('/packing/:itemId', deletePackingItem);
router.post('/:tripId/packing/reset', resetPackingItems);

export default router;
