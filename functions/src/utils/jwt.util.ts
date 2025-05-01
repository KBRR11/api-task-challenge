import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { User } from '../models/user.model';

// ✅ Es recomendable que esto venga de variables de entorno (.env)
const JWT_SECRET: Secret = process.env.JWT_SECRET || '123';


/**
 * Genera un token JWT para un usuario
 * @param user Datos del usuario para incluir en el token
 * @returns Token JWT generado como string
 */
export const generateToken = (user: User): string => {
  const payload = {
    sub: user.id,
    email: user.email,
    iat: Math.floor(Date.now() / 1000) // En segundos, como espera JWT
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d'
  });
};

/**
 * Verifica y decodifica un token JWT
 * @param token Token JWT a verificar
 * @returns Payload decodificado si el token es válido
 * @throws Error si el token es inválido o ha expirado
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};

/**
 * Extrae el ID de usuario desde un token JWT
 * @param token Token JWT
 * @returns ID del usuario (sub)
 */
export const getUserIdFromToken = (token: string): string => {
  const decoded = verifyToken(token);
  return decoded.sub as string;
};
