import { Request, Response, NextFunction } from 'express';
import { verifyToken,  } from '../utils/jwt.util';

/**
 * Middleware para verificar la autenticación mediante JWT
 * Verifica que el token sea válido y añade el ID del usuario a la solicitud
 */
export const authMiddleware = (
    req: Request, 
    res: Response, 
    next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: 'No se proporcionó token de autenticación' });
    return;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({ error: 'Formato de token inválido' });
    return;
  }

  const token = parts[1];

  try {
    const decoded = verifyToken(token);
    (req as any).userId = decoded.sub;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

/**
 * Middleware opcional que extrae el ID de usuario del token si está presente,
 * pero no requiere que esté presente para continuar
 */
export const optionalAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const token = parts[1];
        try {
          const decoded = verifyToken(token);
          (req as any).userId = decoded.sub;
        } catch (error) {
          // Si el token es inválido, simplemente no establecemos userId
          // pero dejamos que la solicitud continúe
        }
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

/**
 * Extiende la interfaz Request para incluir userId
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}