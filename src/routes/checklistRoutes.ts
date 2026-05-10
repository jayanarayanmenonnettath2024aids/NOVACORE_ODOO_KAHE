import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import { packingItemSchema } from '../utils/validators';
import { 
  getChecklist, 
  addChecklistItem, 
  updateChecklistItem, 
  deleteChecklistItem, 
  resetChecklist 
} from '../controllers/checklistController';

const router = Router();

router.use(authenticate);

router.get('/:tripId', getChecklist);
router.post('/:tripId', validateRequest(packingItemSchema), addChecklistItem);
router.put('/:itemId', updateChecklistItem);
router.delete('/:itemId', deleteChecklistItem);
router.post('/:tripId/reset', resetChecklist);

export default router;
