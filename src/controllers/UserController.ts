import type { Request, Response } from 'express';
import UserService from '../services/UserService';
import { asyncHandler } from '../utils/asyncHandler';

const UserController = {
  getAllUsers: asyncHandler(async (_req: Request, res: Response) => {
    const users = await UserService.getAllUsers();
    res.status(200).json(users);
  }),

  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.getUserById(Number(req.params.id), req.user!);
    res.status(200).json(user);
  }),

  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.updateUser(
      Number(req.params.id),
      req.validatedData as {
        username?: string;
        email?: string;
        role?: 'admin' | 'analyst' | 'viewer';
        status?: 'active' | 'inactive' | 'suspended';
      },
    );

    res.status(200).json(user);
  }),

  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    await UserService.deleteUser(Number(req.params.id));
    res.status(204).send();
  }),

  assignRole: asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.assignRole(
      Number(req.params.id),
      (req.validatedData as { role: 'admin' | 'analyst' | 'viewer' }).role,
    );

    res.status(200).json(user);
  }),

  changeStatus: asyncHandler(async (req: Request, res: Response) => {
    const user = await UserService.changeStatus(
      Number(req.params.id),
      (req.validatedData as { status: 'active' | 'inactive' | 'suspended' }).status,
    );

    res.status(200).json(user);
  }),
};

export default UserController;
