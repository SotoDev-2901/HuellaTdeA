import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  verifyEmailHandler,
  resendVerificationHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
} from './auth.controller.js';

export const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
router.post('/verify-email', verifyEmailHandler);
router.post('/resend-verification', resendVerificationHandler);
router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler);
