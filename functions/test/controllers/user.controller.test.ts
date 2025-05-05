// test/controllers/user.controller.test.ts
import { UsersController } from '../../src/controllers/users.controller';
import { UserService } from '../../src/services/user.service';
import { User } from '../../src/models/user.model';
import { Request, Response } from 'express';
import { Timestamp } from 'firebase-admin/firestore';
import { UserNotFoundException } from '../../src/common/exceptions/custom-exceptions';

// Mock del servicio de usuarios
jest.mock('../../src/services/user.service');

// Mock del módulo de manejo de errores
jest.mock('../../src/utils/error-handler', () => ({
  handleError: jest.fn().mockImplementation((error, res) => {
    if (error instanceof Error && error.message === 'Usuario no encontrado') {
      res.status(404).json({
        statusCode: 404,
        message: 'Usuario no encontrado',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        statusCode: 500,
        message: 'Error interno del servidor',
        timestamp: new Date().toISOString()
      });
    }
  })
}));

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
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      
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
      mockUserService.findByEmail.mockResolvedValue(null);
      
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
      mockUserService.findByEmail.mockRejectedValue(error);
      
      // Ejecutar el método
      await usersController.findByEmail(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se intentó llamar al servicio
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
      
      // Verificar solo el status code, sin verificar el mensaje exacto
      expect(responseStatus).toHaveBeenCalledWith(500);
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
      
      const token = 'jwt-token-mock';
      
      // Configurar request mock
      mockRequest = {
        body: userData,
      };
      
      // Configurar el mock del servicio
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue({ user: createdUser, token });
      
      // Ejecutar el método
      await usersController.createUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se llamó al servicio correctamente
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Usuario creado exitosamente',
        user: createdUser,
        token
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
      
      const mockToken = 'jwt-token-mock';
      
      // Configurar request mock
      mockRequest = {
        body: userData,
      };
      
      // Configurar el mock del servicio
      mockUserService.findByEmail.mockResolvedValue(existingUser);
      mockUserService.authenticateUser.mockResolvedValue({ 
        user: existingUser, 
        token: mockToken 
      });
      
      // Ejecutar el método
      await usersController.createUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se llamó a findByEmail pero no a createUser
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('existing@example.com');
      expect(mockUserService.authenticateUser).toHaveBeenCalledWith('existing@example.com');
      expect(mockUserService.createUser).not.toHaveBeenCalled();
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(409);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'Ya existe un usuario con este email',
        user: existingUser,
        token: mockToken
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
      mockUserService.findByEmail.mockResolvedValue(null);
      mockUserService.createUser.mockRejectedValue(new Error('Service error'));
      
      // Ejecutar el método
      await usersController.createUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se intentó llamar al servicio
      expect(mockUserService.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUserService.createUser).toHaveBeenCalledWith(userData);
      
      // Verificar solo el status code
      expect(responseStatus).toHaveBeenCalledWith(500);
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
      
      const mockToken = 'jwt-token-mock';
      
      // Configurar request mock
      mockRequest = {
        body: userData,
      };
      
      // Configurar los mocks del servicio
      mockUserService.findOrCreateUser.mockResolvedValue({
        user: existingUser,
        token: mockToken,
        isNewUser: false
      });
      
      // Ejecutar el método
      await usersController.findOrCreateUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se llamó al servicio correctamente
      expect(mockUserService.findOrCreateUser).toHaveBeenCalledWith('existing@example.com');
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Usuario encontrado',
        user: existingUser,
        token: mockToken,
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
      
      const mockToken = 'jwt-token-mock';
      
      // Configurar request mock
      mockRequest = {
        body: userData,
      };
      
      // Configurar los mocks del servicio
      mockUserService.findOrCreateUser.mockResolvedValue({
        user: createdUser,
        token: mockToken,
        isNewUser: true
      });
      
      // Ejecutar el método
      await usersController.findOrCreateUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se llamó al servicio correctamente
      expect(mockUserService.findOrCreateUser).toHaveBeenCalledWith('new@example.com');
      // Ya no verificamos si se llamó a findByEmail porque ese método no se llama directamente
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Usuario creado exitosamente',
        user: createdUser,
        token: mockToken,
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
      mockUserService.findOrCreateUser.mockRejectedValue(new Error('Service error'));
      
      // Ejecutar el método
      await usersController.findOrCreateUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se intentó llamar al servicio
      expect(mockUserService.findOrCreateUser).toHaveBeenCalledWith('test@example.com');
      
      // Verificar solo el status code
      expect(responseStatus).toHaveBeenCalledWith(500);
    });
  });

  describe('authenticateUser', () => {
    it('debe autenticar a un usuario existente', async () => {
      // Datos de prueba
      const userData = {
        email: 'existing@example.com',
      };
      
      const existingUser: User = {
        id: 'existing-id',
        email: 'existing@example.com',
        createdAt: Timestamp.now(),
      };
      
      const mockToken = 'jwt-token-mock';
      
      // Configurar request mock
      mockRequest = {
        body: userData,
      };
      
      // Configurar los mocks del servicio
      mockUserService.authenticateUser.mockResolvedValue({
        user: existingUser,
        token: mockToken
      });
      
      // Ejecutar el método
      await usersController.authenticateUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se llamó al servicio correctamente
      expect(mockUserService.authenticateUser).toHaveBeenCalledWith('existing@example.com');
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(200);
      expect(responseJson).toHaveBeenCalledWith({
        message: 'Autenticación exitosa',
        user: existingUser,
        token: mockToken
      });
    });

    it('debe retornar 404 si el usuario no existe', async () => {
      // Datos de prueba
      const userData = {
        email: 'nonexistent@example.com',
      };
      
      // Configurar request mock
      mockRequest = {
        body: userData,
      };
      
      // Configurar el mock para lanzar error
      const error = new Error('Usuario no encontrado');
      mockUserService.authenticateUser.mockRejectedValue(error);
      
      // Ejecutar el método
      await usersController.authenticateUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que se intentó llamar al servicio
      expect(mockUserService.authenticateUser).toHaveBeenCalledWith('nonexistent@example.com');
      
      // Verificar solo el status code
      expect(responseStatus).toHaveBeenCalledWith(404);
    });

    it('debe retornar 400 si no se proporciona email', async () => {
      // Configurar request mock sin email
      mockRequest = {
        body: {},
      };
      
      // Ejecutar el método
      await usersController.authenticateUser(mockRequest as Request, mockResponse as Response);
      
      // Verificar que no se llamó al servicio
      expect(mockUserService.authenticateUser).not.toHaveBeenCalled();
      
      // Verificar la respuesta HTTP
      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        message: 'El email es requerido' 
      });
    });
  });
});