// test/controllers/tasks.controller.test.ts
import { TasksController } from '../../src/controllers/tasks.controller';
import { TaskService } from '../../src/services/task.service';
import { UserService } from '../../src/services/user.service';
import { Request, Response } from 'express';
import { Task } from '../../src/models/task.model';
import { User } from '../../src/models/user.model';
import { Timestamp } from 'firebase-admin/firestore';

// Mocks
jest.mock('../../src/services/task.service');
jest.mock('../../src/services/user.service');

describe('TasksController', () => {

  interface CustomRequest extends Request {
    userId?: string;
  }

  let controller: TasksController;
  let mockRequest: Partial<CustomRequest>;
  let mockResponse: Partial<Response>;
  let mockTaskService: jest.Mocked<TaskService>;
  let mockUserService: jest.Mocked<UserService>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar mocks para los servicios
    mockTaskService = new TaskService() as jest.Mocked<TaskService>;
    mockUserService = new UserService() as jest.Mocked<UserService>;
    
    (TaskService as jest.Mock).mockImplementation(() => mockTaskService);
    (UserService as jest.Mock).mockImplementation(() => mockUserService);
    
    // Inicializar el controlador con los servicios mockeados
    controller = new TasksController();
    
    // Configurar mock para response
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    
    mockRequest = {};
    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('getAllTasksByUserId', () => {
    it('debería devolver las tareas del usuario', async () => {
      // Crear un array de tareas mock
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Tarea de prueba',
          description: 'Descripción de prueba',
          completed: false,
          userId: '123',
          createdAt: Timestamp.now()
        }
      ];
      
      // Configurar el mock para getAllTasksByUserId
      mockTaskService.getAllTasksByUserId.mockResolvedValue(mockTasks);
      
      // Configurar userId en el request (simulando que viene del token JWT)
      mockRequest.userId = '123';

      // Ejecutar el método
      await controller.getAllTasksByUserId(
        mockRequest as Request,
        mockResponse as Response
      );

      // Verificar que se llamó al servicio correctamente
      expect(mockTaskService.getAllTasksByUserId).toHaveBeenCalledWith('123');
      
      // Verificar la respuesta
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ tasks: mockTasks });
    });

    it('debería devolver 400 si no hay userId', async () => {
      // No establecer userId en el request
      mockRequest.userId = undefined;

      // Ejecutar el método
      await controller.getAllTasksByUserId(
        mockRequest as Request,
        mockResponse as Response
      );

      // Verificar que no se llamó al servicio
      expect(mockTaskService.getAllTasksByUserId).not.toHaveBeenCalled();
      
      // Verificar la respuesta de error
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'El ID del usuario es requerido'
        })
      );
    });
  });

  describe('createTask', () => {
    it('debería crear una tarea exitosamente', async () => {
      // Crear una tarea mock para el retorno
      const mockTask: Task = {
        id: '1',
        title: 'Nueva tarea',
        description: 'Descripción de la tarea',
        completed: false,
        userId: '123',
        createdAt: Timestamp.now()
      };
      
      // Mock del usuario
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        createdAt: Timestamp.now()
      };
      
      // Configurar los mocks de los servicios
      mockUserService.findById.mockResolvedValue(mockUser);
      mockTaskService.createTask.mockResolvedValue(mockTask);
      
      // Configurar el request
      mockRequest.body = {
        title: 'Nueva tarea',
        description: 'Descripción de la tarea',
      };
      mockRequest.userId = '123';  // Simular token JWT

      // Ejecutar el método
      await controller.createTask(
        mockRequest as Request, 
        mockResponse as Response
      );

      // Verificar que se llamaron a los servicios correctamente
      expect(mockUserService.findById).toHaveBeenCalledWith('123');
      expect(mockTaskService.createTask).toHaveBeenCalledWith({
        title: 'Nueva tarea',
        description: 'Descripción de la tarea',
        userId: '123'
      });
      
      // Verificar la respuesta
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Tarea creada exitosamente',
        task: mockTask
      });
    });

    it('debería devolver 400 si falta el título', async () => {
      // Configurar request sin título
      mockRequest.body = {
        description: 'Solo descripción'
      };
      mockRequest.userId = '123';

      // Ejecutar el método
      await controller.createTask(
        mockRequest as Request, 
        mockResponse as Response
      );

      // Verificar que no se llamó al servicio
      expect(mockUserService.findById).not.toHaveBeenCalled();
      expect(mockTaskService.createTask).not.toHaveBeenCalled();
      
      // Verificar la respuesta de error
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('El título y el ID del usuario son requeridos')
        })
      );
    });

    it('debería devolver 404 si el usuario no existe', async () => {
      // Configurar el mock para que devuelva null (usuario no existe)
      mockUserService.findById.mockResolvedValue(null);
      
      // Configurar el request
      mockRequest.body = {
        title: 'Nueva tarea',
        description: 'Descripción'
      };
      mockRequest.userId = '123';

      // Ejecutar el método
      await controller.createTask(
        mockRequest as Request, 
        mockResponse as Response
      );

      // Verificar que se llamó a findById pero no a createTask
      expect(mockUserService.findById).toHaveBeenCalledWith('123');
      expect(mockTaskService.createTask).not.toHaveBeenCalled();
      
      // Verificar la respuesta de error
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Usuario no encontrado'
        })
      );
    });
  });

  describe('updateTask', () => {
    it('debería actualizar una tarea correctamente', async () => {
      // Mock de tarea actualizada
      const updatedTask: Task = {
        id: '1',
        title: 'Tarea actualizada',
        description: 'Nueva descripción',
        completed: true,
        userId: '123',
        createdAt: Timestamp.now()
      };
      
      // Mock de tarea existente
      const existingTask: Task = {
        id: '1',
        title: 'Tarea original',
        description: 'Descripción original',
        completed: false,
        userId: '123',
        createdAt: Timestamp.now()
      };
      
      // Mock de usuario
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        createdAt: Timestamp.now()
      };
      
      // Configurar los mocks
      mockUserService.findById.mockResolvedValue(mockUser);
      mockTaskService.getTaskById.mockResolvedValue(existingTask);
      mockTaskService.updateTask.mockResolvedValue(updatedTask);
      
      // Configurar el request
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        title: 'Tarea actualizada',
        description: 'Nueva descripción',
        completed: true
      };
      mockRequest.userId = '123';

      // Ejecutar el método
      await controller.updateTask(
        mockRequest as Request,
        mockResponse as Response
      );

      // Verificar que se llamaron a los servicios correctamente
      expect(mockUserService.findById).toHaveBeenCalledWith('123');
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('1');
      expect(mockTaskService.updateTask).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          title: 'Tarea actualizada',
          description: 'Nueva descripción',
          completed: true,
          userId: '123'
        })
      );
      
      // Verificar la respuesta
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Tarea actualizada exitosamente',
        task: updatedTask
      });
    });

    it('debería devolver 403 si la tarea pertenece a otro usuario', async () => {
      // Mock de tarea que pertenece a otro usuario
      const otherUserTask: Task = {
        id: '1',
        title: 'Tarea de otro usuario',
        description: 'Descripción',
        completed: false,
        userId: 'other-user-id',
        createdAt: Timestamp.now()
      };
      
      // Mock de usuario
      const mockUser: User = {
        id: '123',
        email: 'test@example.com',
        createdAt: Timestamp.now()
      };
      
      // Configurar los mocks
      mockUserService.findById.mockResolvedValue(mockUser);
      mockTaskService.getTaskById.mockResolvedValue(otherUserTask);
      
      // Configurar el request
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        title: 'Intento actualizar tarea de otro usuario',
      };
      mockRequest.userId = '123';  // ID diferente a la tarea

      // Ejecutar el método
      await controller.updateTask(
        mockRequest as Request,
        mockResponse as Response
      );

      // Verificar que se verificó la propiedad pero no se llamó a updateTask
      expect(mockUserService.findById).toHaveBeenCalledWith('123');
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('1');
      expect(mockTaskService.updateTask).not.toHaveBeenCalled();
      
      // Verificar la respuesta de error
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No tienes permiso para modificar esta tarea'
        })
      );
    });
  });

  describe('deleteTask', () => {
    it('debería eliminar una tarea correctamente', async () => {
      // Mock de tarea a eliminar
      const taskToDelete: Task = {
        id: '1',
        title: 'Tarea a eliminar',
        description: 'Descripción',
        completed: false,
        userId: '123',
        createdAt: Timestamp.now()
      };
      
      // Configurar los mocks
      mockTaskService.getTaskById.mockResolvedValue(taskToDelete);
      mockTaskService.deleteTask.mockResolvedValue(undefined);
      
      // Configurar el request
      mockRequest.params = { id: '1' };
      mockRequest.userId = '123';

      // Ejecutar el método
      await controller.deleteTask(
        mockRequest as Request,
        mockResponse as Response
      );

      // Verificar que se llamaron a los servicios correctamente
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('1');
      expect(mockTaskService.deleteTask).toHaveBeenCalledWith('1', '123');
      
      // Verificar la respuesta
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Tarea eliminada exitosamente'
      });
    });

    it('debería devolver 404 si la tarea no existe', async () => {
      // Configurar el mock para que no encuentre la tarea
      mockTaskService.getTaskById.mockResolvedValue(null);
      
      // Configurar el request
      mockRequest.params = { id: 'nonexistent-id' };
      mockRequest.userId = '123';

      // Ejecutar el método
      await controller.deleteTask(
        mockRequest as Request,
        mockResponse as Response
      );

      // Verificar que se buscó la tarea pero no se llamó a deleteTask
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('nonexistent-id');
      expect(mockTaskService.deleteTask).not.toHaveBeenCalled();
      
      // Verificar la respuesta de error
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Tarea no encontrada'
        })
      );
    });
  });

  describe('toggleTaskCompletion', () => {
    it('debería marcar una tarea como completada', async () => {
      // Mock de tarea antes de actualizar
      const existingTask: Task = {
        id: '1',
        title: 'Tarea pendiente',
        description: 'Descripción',
        completed: false,
        userId: '123',
        createdAt: Timestamp.now()
      };
      
      // Mock de tarea después de actualizar
      const completedTask: Task = {
        ...existingTask,
        completed: true
      };
      
      // Configurar los mocks
      mockTaskService.getTaskById.mockResolvedValue(existingTask);
      mockTaskService.toggleTaskCompletion.mockResolvedValue(completedTask);
      
      // Configurar el request
      mockRequest.params = { id: '1' };
      mockRequest.body = { completed: true };
      mockRequest.userId = '123';

      // Ejecutar el método
      await controller.toggleTaskCompletion(
        mockRequest as Request,
        mockResponse as Response
      );

      // Verificar que se llamaron a los servicios correctamente
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('1');
      expect(mockTaskService.toggleTaskCompletion).toHaveBeenCalledWith(
        '1', '123', true
      );
      
      // Verificar la respuesta
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Tarea marcada como completada exitosamente',
        task: completedTask
      });
    });
  });

  describe('getTaskById', () => {
    it('debería devolver una tarea por su ID', async () => {
      // Mock de tarea
      const task: Task = {
        id: '1',
        title: 'Tarea de prueba',
        description: 'Descripción',
        completed: false,
        userId: '123',
        createdAt: Timestamp.now()
      };
      
      // Configurar el mock
      mockTaskService.getTaskById.mockResolvedValue(task);
      
      // Configurar el request
      mockRequest.params = { id: '1' };
      mockRequest.userId = '123';

      // Ejecutar el método
      await controller.getTaskById(
        mockRequest as Request,
        mockResponse as Response
      );

      // Verificar que se llamó al servicio correctamente
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('1');
      
      // Verificar la respuesta
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ task });
    });

    it('debería devolver 403 si la tarea pertenece a otro usuario', async () => {
      // Mock de tarea que pertenece a otro usuario
      const otherUserTask: Task = {
        id: '1',
        title: 'Tarea de otro usuario',
        description: 'Descripción',
        completed: false,
        userId: 'other-user-id',
        createdAt: Timestamp.now()
      };
      
      // Configurar el mock
      mockTaskService.getTaskById.mockResolvedValue(otherUserTask);
      
      // Configurar el request
      mockRequest.params = { id: '1' };
      mockRequest.userId = '123';  // ID diferente de la tarea

      // Ejecutar el método
      await controller.getTaskById(
        mockRequest as Request,
        mockResponse as Response
      );

      // Verificar que se llamó al servicio correctamente
      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('1');
      
      // Verificar la respuesta de error
      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'No tienes permiso para acceder a esta tarea'
        })
      );
    });
  });
});