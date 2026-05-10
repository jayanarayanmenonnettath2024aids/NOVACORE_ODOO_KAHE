import { Router } from 'express';
import { signup, login } from '../controllers/authController';
import { validateRequest } from '../middlewares/validationMiddleware';
import { signupSchema, loginSchema } from '../utils/validators';

const router = Router();

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);

export default router;
