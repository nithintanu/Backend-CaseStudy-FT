import type { NextFunction, Request, Response } from 'express';
import type { ObjectSchema } from 'joi';

const validateRequest = <T>(schema: ObjectSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      res.status(400).json({
        errors: error.details.map((detail) => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
      return;
    }

    req.validatedData = value;
    next();
  };
};

export default validateRequest;
