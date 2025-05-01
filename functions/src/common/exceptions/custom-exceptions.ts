import { HttpException } from './http-exception';

export class UserNotFoundException extends HttpException {
  constructor(message?: string) {
    super(message || 'Usuario no encontrado', 404);
  }
}
