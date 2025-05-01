import { Response } from 'express';
import { HttpException } from '../common/exceptions/http-exception';

export function handleError(error: any, res: Response) {
  if (error instanceof HttpException) {
    return res.status(error.status).json({
      statusCode: error.status,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }

  console.error('Error no controlado:', error);
  return res.status(500).json({
    statusCode: 500,
    message: 'Error interno del servidor',
    timestamp: new Date().toISOString(),
  });
}
