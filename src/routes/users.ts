import { Router } from 'express';
import UserController from '../controllers/UserController';
import verifyJWT from '../middleware/auth';
import validateRequest from '../middleware/validation';
import { requireRole } from '../middleware/authorization';
import { assignRoleSchema, changeStatusSchema, updateUserSchema } from '../validation/userSchemas';

const router = Router();

router.use(verifyJWT);

router.get('/', requireRole('admin'), UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', requireRole('admin'), validateRequest(updateUserSchema), UserController.updateUser);
router.delete('/:id', requireRole('admin'), UserController.deleteUser);
router.post('/:id/assign-role', requireRole('admin'), validateRequest(assignRoleSchema), UserController.assignRole);
router.post('/:id/change-status', requireRole('admin'), validateRequest(changeStatusSchema), UserController.changeStatus);

export default router;
