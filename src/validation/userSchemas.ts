import Joi from 'joi';
import { ROLES, USER_STATUS } from '../constants';

export const updateUserSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50),
  email: Joi.string().trim().email(),
  role: Joi.string().valid(ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER),
  status: Joi.string().valid(USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.SUSPENDED),
}).or('username', 'email', 'role', 'status');

export const assignRoleSchema = Joi.object({
  role: Joi.string().valid(ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER).required(),
});

export const changeStatusSchema = Joi.object({
  status: Joi.string().valid(USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.SUSPENDED).required(),
});
