import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/user.dto';

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
      console.error('Error en findByEmail:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message: 'Error al buscar usuario', error: message });
    }
  };

  /**
   * Crea un nuevo usuario
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
        res.status(409).json({ 
          message: 'Ya existe un usuario con este email',
          user: existingUser 
        });
        return;
      }
      
      const newUser = await this.userService.createUser(createUserDto);
      
      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: newUser
      });
    } catch (error) {
      console.error('Error en createUser:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message: 'Error al crear usuario', error: message });
    }
  };

  /**
   * Busca un usuario por su email o lo crea si no existe
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
      
      const user = await this.userService.findOrCreateUser(email);
      const isNewUser = !(await this.userService.findByEmail(email));
      
      res.status(200).json({
        message: isNewUser ? 'Usuario creado exitosamente' : 'Usuario encontrado',
        user,
        isNewUser
      });
    } catch (error) {
      console.error('Error en findOrCreateUser:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message: 'Error al procesar la solicitud', error: message });
    }
  };
}