import Joi from 'joi';

export const createRecordSchema = Joi.object({
  amount: Joi.number().greater(0).required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().trim().max(100).required(),
  description: Joi.string().allow('', null),
  date: Joi.date().iso().optional(),
  currency: Joi.string().trim().length(3).uppercase().optional(),
});

export const updateRecordSchema = Joi.object({
  amount: Joi.number().greater(0),
  type: Joi.string().valid('income', 'expense'),
  category: Joi.string().trim().max(100),
  description: Joi.string().allow('', null),
  date: Joi.date().iso(),
  currency: Joi.string().trim().length(3).uppercase(),
}).or('amount', 'type', 'category', 'description', 'date', 'currency');
