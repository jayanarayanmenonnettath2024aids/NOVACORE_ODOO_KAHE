import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validationMiddleware';
import { noteSchema } from '../utils/validators';
import { 
  getNotes, 
  addNote, 
  updateNote, 
  deleteNote 
} from '../controllers/notesController';

const router = Router();

router.use(authenticate);

router.get('/:tripId', getNotes);
router.post('/:tripId', validateRequest(noteSchema), addNote);
router.put('/:noteId', updateNote);
router.delete('/:noteId', deleteNote);

export default router;
