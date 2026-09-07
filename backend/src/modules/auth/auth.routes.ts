import { Router } from 'express';
import { registerHandler, loginHandler } from './auth.controller.js';

export const router = Router();

router.post('/register', registerHandler);
router.post('/login', loginHandler);
