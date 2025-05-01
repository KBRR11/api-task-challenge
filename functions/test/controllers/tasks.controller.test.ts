import { TasksController } from '../../src/controllers/tasks.controller';
import { TaskService } from '../../src/services/task.service';
import { UserService } from '../../src/services/user.service';
import { Request, Response } from 'express';

// Mocks
jest.mock('../../src/services/task.service');
jest.mock('../../src/services/user.service');

describe('TasksController', () => {
  let controller: TasksController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    controller = new TasksController();
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
      const mockTasks = [{ id: '1', title: 'Tarea de prueba' }];
      (TaskService.prototype.getAllTasksByUserId as jest.Mock).mockResolvedValue(mockTasks);

      mockRequest.params = { userId: '123' };

      await controller.getAllTasksByUserId(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ tasks: mockTasks });
    });

    it('debería devolver 400 si no hay userId', async () => {
      mockRequest.params = {};

      await controller.getAllTasksByUserId(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe('createTask', () => {
    it('debería crear una tarea', async () => {
      const task = { id: '1', title: 'Nueva tarea' };
      (UserService.prototype.findById as jest.Mock).mockResolvedValue(true);
      (TaskService.prototype.createTask as jest.Mock).mockResolvedValue(task);

      mockRequest.body = {
        title: 'Nueva tarea',
        description: 'Descripción',
        userId: '123',
      };

      await controller.createTask(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Tarea creada exitosamente',
        task,
      });
    });

    it('debería devolver 400 si falta el título o userId', async () => {
      mockRequest.body = { title: '' };

      await controller.createTask(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('debería devolver 404 si el usuario no existe', async () => {
      (UserService.prototype.findById as jest.Mock).mockResolvedValue(null);

      mockRequest.body = {
        title: 'Tarea',
        userId: '123',
      };

      await controller.createTask(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
    });
  });

  describe('updateTask', () => {
    it('debería actualizar una tarea', async () => {
      const updatedTask = { id: '1', title: 'Actualizada' };
      (UserService.prototype.findById as jest.Mock).mockResolvedValue(true);
      (TaskService.prototype.getTaskById as jest.Mock).mockResolvedValue(true);
      (TaskService.prototype.updateTask as jest.Mock).mockResolvedValue(updatedTask);

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        title: 'Actualizada',
        userId: '123',
      };

      await controller.updateTask(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Tarea actualizada exitosamente',
        task: updatedTask,
      });
    });

    it('debería devolver 404 si la tarea no existe', async () => {
      (UserService.prototype.findById as jest.Mock).mockResolvedValue(true);
      (TaskService.prototype.getTaskById as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        userId: '123',
      };

      await controller.updateTask(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteTask', () => {
    it('debería eliminar una tarea', async () => {
      (TaskService.prototype.deleteTask as jest.Mock).mockResolvedValue(undefined);

      mockRequest.params = { id: '1' };
      mockRequest.body = { userId: '123' };

      await controller.deleteTask(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Tarea eliminada exitosamente',
      });
    });

    it('debería devolver 401 si no tiene permiso', async () => {
      (TaskService.prototype.deleteTask as jest.Mock).mockRejectedValue(new Error('No tienes permiso para eliminar esta tarea'));

      mockRequest.params = { id: '1' };
      mockRequest.body = { userId: '123' };

      await controller.deleteTask(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
    });
  });

  describe('toggleTaskCompletion', () => {
    it('debería marcar la tarea como completada', async () => {
      const updatedTask = { id: '1', completed: true };
      (TaskService.prototype.toggleTaskCompletion as jest.Mock).mockResolvedValue(updatedTask);

      mockRequest.params = { id: '1' };
      mockRequest.body = { userId: '123', completed: true };

      await controller.toggleTaskCompletion(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: `Tarea marcada como completada exitosamente`,
        task: updatedTask,
      });
    });

    it('debería devolver 400 si faltan parámetros', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { userId: '123' }; // falta completed

      await controller.toggleTaskCompletion(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });
});
