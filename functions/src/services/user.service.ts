import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';
import { CreateUserDto } from '../dtos/user.dto';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from '../utils/jwt.util';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Busca un usuario por su email
   * @param email Correo del usuario
   * @returns Promise con el usuario si existe, null si no existe
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /**
   * Crea un nuevo usuario y genera un token JWT
   * @param createUserDto DTO con los datos para crear el usuario
   * @returns Promise con el usuario creado y su token JWT
   */
  async createUser(createUserDto: CreateUserDto): Promise<{ user: User; token: string }> {
    // Verificar si el usuario ya existe
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new Error('El usuario con este correo ya existe');
    }

    const newUser: User = {
      id: uuidv4(),
      email: createUserDto.email,
      createdAt: Timestamp.now()
    };

    const createdUser = await this.userRepository.create(newUser);
    
    // Generar token JWT para el usuario
    const token = generateToken(createdUser);
    
    return { user: createdUser, token };
  }

  /**
   * Obtiene un usuario por su ID o lo crea si no existe, y genera un token JWT
   * @param email Correo del usuario
   * @returns Promise con el usuario existente o recién creado y su token JWT
   */
  async findOrCreateUser(email: string): Promise<{ user: User; token: string; isNewUser: boolean }> {
    const user = await this.findByEmail(email);
    
    if (user) {
      // Usuario existente - generar un nuevo token
      const token = generateToken(user);
      return { user, token, isNewUser: false };
    }
    
    // Crear nuevo usuario y generar token
    const result = await this.createUser({ email });
    return { ...result, isNewUser: true };
  }

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario
   * @returns Promise con el usuario si existe, null si no existe
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
  
  /**
   * Autentica a un usuario por su email y devuelve un token JWT
   * @param email Correo del usuario
   * @returns Promise con el usuario y su token JWT
   * @throws Error si el usuario no existe
   */
  async authenticateUser(email: string): Promise<{ user: User; token: string }> {
    const user = await this.findByEmail(email);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    
    const token = generateToken(user);
    return { user, token };
  }
}