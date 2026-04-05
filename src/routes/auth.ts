import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import verifyJWT from '../middleware/auth';
import validateRequest from '../middleware/validation';
import { loginSchema, registerSchema } from '../validation/authSchemas';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', verifyJWT, AuthController.me);

export default router;
