import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

export const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      if (error && error.errors) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map((e: any) => ({ path: e.path.join('.'), message: e.message }))
        });
      }
      return res.status(400).json({ error: 'Validation failed' });
    }
  };
};
