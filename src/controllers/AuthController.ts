import type { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { asyncHandler } from '../utils/asyncHandler';

const AuthController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.register(req.validatedData as {
      username: string;
      email: string;
      password: string;
    });

    res.status(201).json(result);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.login(req.validatedData as {
      username: string;
      password: string;
    });

    res.status(200).json(result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    res.status(200).json({ user: req.user });
  }),
};

export default AuthController;
