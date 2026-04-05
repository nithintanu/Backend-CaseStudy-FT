import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50).required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).max(128).required(),
});

export const loginSchema = Joi.object({
  username: Joi.string().trim().required(),
  password: Joi.string().required(),
});
