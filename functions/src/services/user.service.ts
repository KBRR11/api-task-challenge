import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';
import { CreateUserDto } from '../dtos/user.dto';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

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
   * Crea un nuevo usuario
   * @param createUserDto DTO con los datos para crear el usuario
   * @returns Promise con el usuario creado
   */
  async createUser(createUserDto: CreateUserDto): Promise<User> {
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

    return this.userRepository.create(newUser);
  }

  /**
   * Obtiene un usuario por su ID o lo crea si no existe
   * @param email Correo del usuario
   * @returns Promise con el usuario existente o recién creado
   */
  async findOrCreateUser(email: string): Promise<User> {
    const user = await this.findByEmail(email);
    
    if (user) {
      return user;
    }
    
    return this.createUser({ email });
  }

  /**
   * Obtiene un usuario por su ID
   * @param id ID del usuario
   * @returns Promise con el usuario si existe, null si no existe
   */
  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}