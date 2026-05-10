import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { 
  getProfile, 
  updateProfile, 
  deleteAccount, 
  getSavedDestinations, 
  addSavedDestination 
} from '../controllers/userController';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/account', deleteAccount);

router.get('/saved-destinations', getSavedDestinations);
router.post('/saved-destinations', addSavedDestination);

export default router;
