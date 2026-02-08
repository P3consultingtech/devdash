import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth';
import { strictAuthLimiter } from '../../middleware/rate-limit';
import { loginSchema, registerSchema, refreshTokenSchema } from '@devdash/shared';
import * as controller from './auth.controller';

const router = Router();

router.post('/register', strictAuthLimiter, validate(registerSchema), controller.register);
router.post('/login', strictAuthLimiter, validate(loginSchema), controller.login);
router.post('/refresh', validate(refreshTokenSchema), controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.getMe);

export default router;
