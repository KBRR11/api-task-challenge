import { HttpException } from './http-exception';

export class UnauthorizedException extends HttpException {
  constructor(message?: string) {
    super(message || 'No autorizado', 401);
  }
}

export class ForbiddenException extends HttpException {
  constructor(message?: string) {
    super(message || 'Acceso prohibido', 403);
  }
}

export class TokenExpiredException extends HttpException {
  constructor(message?: string) {
    super(message || 'Token expirado', 401);
  }
}

export class InvalidTokenException extends HttpException {
  constructor(message?: string) {
    super(message || 'Token inválido', 401);
  }
}