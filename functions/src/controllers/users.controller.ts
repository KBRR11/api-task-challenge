import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/user.dto';
import { handleError } from '../utils/error-handler';
import { UserNotFoundException } from '../common/exceptions/custom-exceptions';

export class UsersController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Busca un usuario por su email
   * @param req Request con email en query
   * @param res Response
   */
  findByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        res.status(400).json({ message: 'El email es requerido' });
        return;
      }
      
      const user = await this.userService.findByEmail(email);
      
      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado', exists: false });
        return;
      }
      
      res.status(200).json({ user, exists: true });
    } catch (error) {
      handleError(error, res);
    }
  };

  /**
   * Crea un nuevo usuario y devuelve un token JWT
   * @param req Request con datos del usuario
   * @param res Response
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ message: 'El email es requerido' });
        return;
      }
      
      const createUserDto: CreateUserDto = { email };
      
      const existingUser = await this.userService.findByEmail(email);
      
      if (existingUser) {
        // Si el usuario ya existe, generamos un token para él
        const token = this.userService.authenticateUser(email);
        res.status(409).json({ 
          message: 'Ya existe un usuario con este email',
          user: existingUser,
          token: (await token).token // Obtiene el token de la promesa
        });
        return;
      }
      
      // Crear nuevo usuario y generar token
      const { user, token } = await this.userService.createUser(createUserDto);
      
      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user,
        token
      });
    } catch (error) {
      handleError(error, res);
    }
  };

  /**
   * Busca un usuario por su email o lo crea si no existe
   * Devuelve un token JWT en ambos casos
   * @param req Request con datos del usuario
   * @param res Response
   */
  findOrCreateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ message: 'El email es requerido' });
        return;
      }
      
      const { user, token, isNewUser } = await this.userService.findOrCreateUser(email);
      
      res.status(200).json({
        message: isNewUser ? 'Usuario creado exitosamente' : 'Usuario encontrado',
        user,
        token,
        isNewUser
      });
    } catch (error) {
      handleError(error, res);
    }
  };
  
  /**
   * Autentica a un usuario existente y devuelve un token JWT
   * @param req Request con email en body
   * @param res Response
   */
  authenticateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      
      if (!email) {
        res.status(400).json({ message: 'El email es requerido' });
        return;
      }
      
      try {
        const { user, token } = await this.userService.authenticateUser(email);
        
        res.status(200).json({
          message: 'Autenticación exitosa',
          user,
          token
        });
      } catch (error) {
        // Si el usuario no existe, devolvemos un 404
        if (error instanceof Error && error.message === 'Usuario no encontrado') {
          throw new UserNotFoundException();
        }
        throw error;
      }
    } catch (error) {
      handleError(error, res);
    }
  };
}