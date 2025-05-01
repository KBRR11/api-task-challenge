import { UsersController } from '../../src/controllers/users.controller';
import { UserService } from '../../src/services/user.service';
import { User } from '../../src/models/user.model';
import { Request, Response } from 'express';
import { Timestamp } from 'firebase-admin/firestore';

// Mock del servicio de usuarios
jest.mock('../../src/services/user.service');

describe('UsersController', () => {
  let usersController: UsersController;
  let mockUserService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar el mock del servicio
    mockUserService = new UserService() as jest.Mocked<UserService>;
    (UserService as jest.Mock).mockImplementation(() => mockUserService);
    
    // Configurar mocks para Request y Response de Express
    responseJson = jest.fn().mockReturnValue({});
    responseStatus = jest.fn().mockReturnThis();
    
    mockResponse = {
      json: responseJson,
      status: responseStatus,
    };
    
    // Inicializar el controlador con el servicio mockeado
    usersController = new UsersController();
  });

  describe('findByEmail', () => {
    it('debe retornar el usuario con estado 200 cuando existe', async () => {
      // Datos de prueba
      const mockUser: User = {
        id: 'user-id-1',
        email: 'test@example.com',
        createdAt: Timestamp.now(),
      };
      
      // Configurar request mock
      mockRequest = {
        query: { email: 'test@example.com' },
      };
      
      // Configurar el mock del servicio
      mockUserService.findByEmail.mockResolvedValueOnce(mockUser);
      
      // Ejecutar el método
      await usersController.findByEmail(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se llamó al servicio correctamente
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({ user: mockUser, exists: true });
    });

    it('debe retornar 404 cuando el usuario no existe', async () => {
      // Configurar request mock
      mockRequest = {
        query: { email: 'nonexistent@example.com' },
      };
      
      // Configurar el mock del servicio
      mockUserService.findByEmail.mockResolvedValueOnce(null);
      
      // Ejecutar el método
      await usersController.findByEmail(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se llamó al servicio correctamente
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Usuario no encontrado', 
        exists: false 
      });
    });

    it('debe retornar 400 si no se proporciona email', async () => {
      // Configurar request mock sin email
      mockRequest = {
        query: {},
      };
      
      // Ejecutar el método
      await usersController.findByEmail(mockRequest as Request, mockResponse as Response);
      
      // Verificar que no se llamó al servicio
      expect(mockUserService.findByEmail).not.toHaveBeenCalled();
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'El email es requerido' 
      });
    });

    it('debe retornar 400 si el email no es string', async () => {
      // Configurar request mock con email como array
      mockRequest = {
        query: { email: ['multiple@emails.com'] as any },
      };
      
      // Ejecutar el método
      await usersController.findByEmail(mockRequest as Request, mockResponse as Response);
      
      // Verificar que no se llamó al servicio
      expect(mockUserService.findByEmail).not.toHaveBeenCalled();
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'El email es requerido' 
      });
    });

    it('debe retornar 500 si el servicio lanza un error', async () => {
      // Configurar request mock
      mockRequest = {
        query: { email: 'test@example.com' },
      };
      
      // Configurar el mock para lanzar error
      const error = new Error('Service error');
      mockUserService.findByEmail.mockRejectedValueOnce(error);
      
      // Ejecutar el método
      await usersController.findByEmail(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se intentó llamar al servicio
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Error al buscar usuario',
        error: 'Service error'
      });
    });
  });

  describe('createUser', () => {
    it('debe crear un usuario y retornar 201', async () => {
      // Datos de prueba
      const userData = {
        email: 'new@example.com',
      };
      
      const createdUser: User = {
        id: 'new-user-id',
        email: 'new@example.com',
        createdAt: Timestamp.now(),
      };
      
      // Configurar request mock
      mockRequest = {
        body: userData,
      };
      
      // Configurar el mock del servicio
      mockUserService.findByEmail.mockResolvedValueOnce(null);
      mockUserService.createUser.mockResolvedValueOnce(createdUser);
      
      // Ejecutar el método
      await usersController.createUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se llamó al servicio correctamente
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Usuario creado exitosamente',
        user: createdUser
      });
    });

    it('debe retornar 409 si el usuario ya existe', async () => {
      // Datos de prueba
      const userData = {
        email: 'existing@example.com',
      };
      
      const existingUser: User = {
        id: 'existing-id',
        email: 'existing@example.com',
        createdAt: Timestamp.now(),
      };
      
      // Configurar request mock
      mockRequest = {
        body: userData,
      };
      
      // Configurar el mock del servicio
      mockUserService.findByEmail.mockResolvedValueOnce(existingUser);
      
      // Ejecutar el método
      await usersController.createUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se llamó a findByEmail pero no a createUser
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('existing@example.com');
      expect(mockUserService.createUser).not.toHaveBeenCalled();
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(409);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Ya existe un usuario con este email',
        user: existingUser 
      });
    });

    it('debe retornar 400 si falta el email', async () => {
      // Configurar request mock sin email
      mockRequest = {
        body: {},
      };
      
      // Ejecutar el método
      await usersController.createUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que no se llamó al servicio
      expect(mockUserService.findByEmail).not.toHaveBeenCalled();
      expect(mockUserService.createUser).not.toHaveBeenCalled();
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'El email es requerido' 
      });
    });

    it('debe retornar 500 si el servicio lanza un error', async () => {
      // Datos de prueba
      const userData = {
        email: 'new@example.com',
      };
      
      // Configurar request mock
      mockRequest = {
        body: userData,
      };
      
      // Configurar el mock para lanzar error
      mockUserService.findByEmail.mockResolvedValueOnce(null);
      mockUserService.createUser.mockRejectedValueOnce(new Error('Service error'));
      
      // Ejecutar el método
      await usersController.createUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se intentó llamar al servicio
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Error al crear usuario',
        error: 'Service error'
      });
    });
  });

  describe('findOrCreateUser', () => {
    it('debe encontrar un usuario existente y retornar 200', async () => {
      // Datos de prueba
      const userData = {
        email: 'existing@example.com',
      };
      
      const existingUser: User = {
        id: 'existing-id',
        email: 'existing@example.com',
        createdAt: Timestamp.now(),
      };
      
      // Configurar request mock
      mockRequest = {
        body: userData,
      };
      
      // Configurar los mocks del servicio
      mockUserService.findOrCreateUser.mockResolvedValueOnce(existingUser);
      mockUserService.findByEmail.mockResolvedValueOnce(existingUser);
      
      // Ejecutar el método
      await usersController.findOrCreateUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se llamó al servicio correctamente
      expect(mockUserService.findOrCreateUser).toHaveBeenCalledWith('existing@example.com');
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('existing@example.com');
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Usuario encontrado',
        user: existingUser,
        isNewUser: false
      });
    });

    it('debe crear un nuevo usuario si no existe y retornar 200', async () => {
      // Datos de prueba
      const userData = {
        email: 'new@example.com',
      };
      
      const createdUser: User = {
        id: 'new-user-id',
        email: 'new@example.com',
        createdAt: Timestamp.now(),
      };
      
      // Configurar request mock
      mockRequest = {
        body: userData,
      };
      
      // Configurar los mocks del servicio
      mockUserService.findOrCreateUser.mockResolvedValueOnce(createdUser);
      mockUserService.findByEmail.mockResolvedValueOnce(null); // Usuario no existía antes
      
      // Ejecutar el método
      await usersController.findOrCreateUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se llamó al servicio correctamente
      expect(mockUserService.findOrCreateUser).toHaveBeenCalledWith('new@example.com');
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('new@example.com');
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Usuario creado exitosamente',
        user: createdUser,
        isNewUser: true
      });
    });

    it('debe retornar 400 si falta el email', async () => {
      // Configurar request mock sin email
      mockRequest = {
        body: {},
      };
      
      // Ejecutar el método
      await usersController.findOrCreateUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que no se llamó al servicio
      expect(mockUserService.findOrCreateUser).not.toHaveBeenCalled();
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'El email es requerido' 
      });
    });

    it('debe retornar 500 si el servicio lanza un error', async () => {
      // Datos de prueba
      const userData = {
        email: 'test@example.com',
      };
      
      // Configurar request mock
      mockRequest = {
        body: userData,
      };
      
      // Configurar el mock para lanzar error
      mockUserService.findOrCreateUser.mockRejectedValueOnce(new Error('Service error'));
      
      // Ejecutar el método
      await usersController.findOrCreateUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se intentó llamar al servicio
      expect(mockUserService.findOrCreateUser).toHaveBeenCalledWith('test@example.com');
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Error al procesar la solicitud',
        error: 'Service error'
      });
    });
  });
});