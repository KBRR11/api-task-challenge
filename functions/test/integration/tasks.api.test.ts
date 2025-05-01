// import request from 'supertest';
// import app from '../../src/main';
// import { TaskService } from '../../src/services/task.service';
// import { UserService } from '../../src/services/user.service';
// import { Task } from '../../src/models/task.model';
// import { User } from '../../src/models/user.model';
// import { Timestamp } from 'firebase-admin/firestore';

// // Mock de los servicios
// jest.mock('../../src/services/task.service');
// jest.mock('../../src/services/user.service');

// describe('Tareas API', () => {
//   let mockTaskService: jest.Mocked<TaskService>;
//   let mockUserService: jest.Mocked<UserService>;

//   beforeEach(() => {
//     // Limpiar mocks antes de cada prueba
//     jest.clearAllMocks();
    
//     // Configurar los mocks de los servicios
//     mockTaskService = new TaskService() as jest.Mocked<TaskService>;
//     (TaskService as jest.Mock).mockImplementation(() => mockTaskService);
    
//     mockUserService = new UserService() as jest.Mocked<UserService>;
//     (UserService as jest.Mock).mockImplementation(() => mockUserService);
//   });

//   describe('GET /tasks/user/:userId', () => {
//     it('debe retornar todas las tareas de un usuario', async () => {
//       // Datos de prueba
//       const userId = 'user123';
//       const mockTasks: Task[] = [
//         {
//           id: 'task1',
//           title: 'Task 1',
//           description: 'Description 1',
//           completed: false,
//           userId,
//           createdAt: Timestamp.now(),
//         },
//         {
//           id: 'task2',
//           title: 'Task 2',
//           description: 'Description 2',
//           completed: true,
//           userId,
//           createdAt: Timestamp.now(),
//         },
//       ];
      
//       // Configurar el mock del servicio
//       mockTaskService.getAllTasksByUserId.mockResolvedValueOnce(mockTasks);
      
//       // Realizar la solicitud HTTP
//       const response = await request(app)
//         .get(`/tasks/user/${userId}`)
//         .expect('Content-Type', /json/)
//         .expect(200);
      
//       // Verificar que se llamó al servicio correctamente
//       expect(mockTaskService.getAllTasksByUserId).toHaveBeenCalledWith(userId);
      
//       // Verificar la respuesta
//       expect(response.body).toHaveProperty('tasks');
//       expect(response.body.tasks).toHaveLength(2);
//       expect(response.body.tasks[0].id).toBe('task1');
//       expect(response.body.tasks[1].id).toBe('task2');
//     });
//   });

//   describe('POST /tasks', () => {
//     it('debe crear una nueva tarea', async () => {
//       // Datos de prueba
//       const taskData = {
//         title: 'Nueva Tarea',
//         description: 'Descripción de prueba',
//         userId: 'user123',
//       };
      
//       const createdTask: Task = {
//         id: 'new-task-id',
//         title: 'Nueva Tarea',
//         description: 'Descripción de prueba',
//         completed: false,
//         userId: 'user123',
//         createdAt: Timestamp.now(),
//       };
      
//       const mockUser: User = {
//         id: 'user123',
//         email: 'test@example.com',
//         createdAt: Timestamp.now(),
//       };
      
//       // Configurar los mocks de los servicios
//       mockUserService.findById.mockResolvedValueOnce(mockUser);
//       mockTaskService.createTask.mockResolvedValueOnce(createdTask);
      
//       // Realizar la solicitud HTTP
//       const response = await request(app)
//         .post('/tasks')
//         .send(taskData)
//         .expect('Content-Type', /json/)
//         .expect(201);
      
//       // Verificar que se llamaron a los servicios correctamente
//       expect(mockUserService.findById).toHaveBeenCalledWith('user123');
//       expect(mockTaskService.createTask).toHaveBeenCalledWith(
//         expect.objectContaining(taskData)
//       );
      
//       // Verificar la respuesta
//       expect(response.body).toHaveProperty('message', 'Tarea creada exitosamente');
//       expect(response.body).toHaveProperty('task');
//       expect(response.body.task).toEqual(createdTask);
//     });

//     it('debe retornar 400 si faltan campos requeridos', async () => {
//       // Datos incompletos (sin título)
//       const incompleteData = {
//         description: 'Solo descripción',
//         userId: 'user123',
//       };
      
//       // Realizar la solicitud HTTP
//       const response = await request(app)
//         .post('/tasks')
//         .send(incompleteData)
//         .expect('Content-Type', /json/)
//         .expect(400);
      
//       // Verificar que no se llamó al servicio
//       expect(mockTaskService.createTask).not.toHaveBeenCalled();
      
//       // Verificar el mensaje de error
//       expect(response.body).toHaveProperty(
//         'message', 
//         'El título y el ID del usuario son requeridos'
//       );
//     });
//   });

//   describe('PUT /tasks/:id', () => {
//     it('debe actualizar una tarea existente', async () => {
//       // Datos de prueba
//       const taskId = 'task123';
//       const updateData = {
//         title: 'Tarea Actualizada',
//         description: 'Nueva descripción',
//         completed: true,
//         userId: 'user123',
//       };
      
//       const updatedTask: Task = {
//         id: taskId,
//         title: 'Tarea Actualizada',
//         description: 'Nueva descripción',
//         completed: true,
//         userId: 'user123',
//         createdAt: Timestamp.now(),
//       };
      
//       const mockUser: User = {
//         id: 'user123',
//         email: 'test@example.com',
//         createdAt: Timestamp.now(),
//       };
      
//       const existingTask: Task = {
//         id: taskId,
//         title: 'Original Task',
//         description: 'Original description',
//         completed: false,
//         userId: 'user123',
//         createdAt: Timestamp.now(),
//       };
      
//       // Configurar los mocks de los servicios
//       mockUserService.findById.mockResolvedValueOnce(mockUser);
//       mockTaskService.getTaskById.mockResolvedValueOnce(existingTask);
//       mockTaskService.updateTask.mockResolvedValueOnce(updatedTask);
      
//       // Realizar la solicitud HTTP
//       const response = await request(app)
//         .put(`/tasks/${taskId}`)
//         .send(updateData)
//         .expect('Content-Type', /json/)
//         .expect(200);
      
//       // Verificar que se llamó al servicio correctamente
//       expect(mockTaskService.updateTask).toHaveBeenCalledWith(
//         taskId,
//         expect.objectContaining(updateData)
//       );
      
//       // Verificar la respuesta
//       expect(response.body).toHaveProperty('message', 'Tarea actualizada exitosamente');
//       expect(response.body).toHaveProperty('task');
//       expect(response.body.task).toEqual(updatedTask);
//     });

//     it('debe retornar 404 si la tarea no existe', async () => {
//       // Datos de prueba
//       const nonExistentId = 'nonexistent-task';
//       const updateData = {
//         title: 'Actualización Imposible',
//         userId: 'user123',
//       };
      
//       const mockUser: User = {
//         id: 'user123',
//         email: 'test@example.com',
//         createdAt: Timestamp.now(),
//       };
      
//       // Configurar los mocks de los servicios
//       mockUserService.findById.mockResolvedValueOnce(mockUser);
//       mockTaskService.getTaskById.mockResolvedValueOnce(null);
      
//       // Realizar la solicitud HTTP
//       const response = await request(app)
//         .put(`/tasks/${nonExistentId}`)
//         .send(updateData)
//         .expect('Content-Type', /json/)
//         .expect(404);
      
//       // Verificar el mensaje de error
//       expect(response.body).toHaveProperty('message', 'Tarea no encontrada');
//     });
//   });

//   describe('DELETE /tasks/:id', () => {
//     it('debe eliminar una tarea existente', async () => {
//       // Datos de prueba
//       const taskId = 'task-to-delete';
//       const userData = {
//         userId: 'user123',
//       };
      
//       // Configurar el mock del servicio
//       mockTaskService.deleteTask.mockResolvedValueOnce();
      
//       // Realizar la solicitud HTTP
//       const response = await request(app)
//         .delete(`/tasks/${taskId}`)
//         .send(userData)
//         .expect('Content-Type', /json/)
//         .expect(200);
      
//       // Verificar que se llamó al servicio correctamente
//       expect(mockTaskService.deleteTask).toHaveBeenCalledWith(taskId, 'user123');
      
//       // Verificar la respuesta
//       expect(response.body).toHaveProperty('message', 'Tarea eliminada exitosamente');
//     });

//     it('debe retornar 404 si la tarea no existe', async () => {
//       // Datos de prueba
//       const nonExistentId = 'nonexistent-task';
//       const userData = {
//         userId: 'user123',
//       };
      
//       // Configurar el mock para lanzar error específico
//       mockTaskService.deleteTask.mockRejectedValueOnce(new Error('Tarea no encontrada'));
      
//       // Realizar la solicitud HTTP
//       const response = await request(app)
//         .delete(`/tasks/${nonExistentId}`)
//         .send(userData)
//         .expect('Content-Type', /json/)
//         .expect(404);
      
//       // Verificar el mensaje de error
//       expect(response.body).toHaveProperty('message', 'Tarea no encontrada');
//     });
//   });

//   describe('GET /tasks/:id', () => {
//     it('debe retornar una tarea por su ID', async () => {
//       // Datos de prueba
//       const taskId = 'task123';
//       const mockTask: Task = {
//         id: taskId,
//         title: 'Task Title',
//         description: 'Task Description',
//         completed: false,
//         userId: 'user123',
//         createdAt: Timestamp.now(),
//       };
      
//       // Configurar el mock del servicio
//       mockTaskService.getTaskById.mockResolvedValueOnce(mockTask);
      
//       // Realizar la solicitud HTTP
//       const response = await request(app)
//         .get(`/tasks/${taskId}`)
//         .expect('Content-Type', /json/)
//         .expect(200);
      
//       // Verificar que se llamó al servicio correctamente
//       expect(mockTaskService.getTaskById).toHaveBeenCalledWith(taskId);
      
//       // Verificar la respuesta
//       expect(response.body).toHaveProperty('task');
//       expect(response.body.task).toEqual(mockTask);
//     });

//     it('debe retornar 404 si la tarea no existe', async () => {
//       // Datos de prueba
//       const nonExistentId = 'nonexistent-task';
      
//       // Configurar el mock del servicio
//       mockTaskService.getTaskById.mockResolvedValueOnce(null);
      
//       // Realizar la solicitud HTTP
//       const response = await request(app)
//         .get(`/tasks/${nonExistentId}`)
//         .expect('Content-Type', /json/)
//         .expect(404);
      
//       // Verificar el mensaje de error
//       expect(response.body).toHaveProperty('message', 'Tarea no encontrada');
//     });
//   });

//   describe('PATCH /tasks/:id/toggle-completion', () => {
//     it('debe cambiar el estado de completado de una tarea', async () => {
//       // Datos de prueba
//       const taskId = 'task123';
//       const requestData = {
//         userId: 'user123',
//         completed: true
//       };
      
//       const updatedTask: Task = {
//         id: taskId,
//         title: 'Task Title',
//         description: 'Task Description',
//         completed: true,
//         userId: 'user123',
//         createdAt: Timestamp.now(),
//       };
      
//       // Configurar el mock del servicio
//       mockTaskService.toggleTaskCompletion.mockResolvedValueOnce(updatedTask);
      
//       // Realizar la solicitud HTTP
//       const response = await request(app)
//         .patch(`/tasks/${taskId}/toggle-completion`)
//         .send(requestData)
//         .expect('Content-Type', /json/)
//         .expect(200);
      
//       // Verificar que se llamó al servicio correctamente
//       expect(mockTaskService.toggleTaskCompletion).toHaveBeenCalledWith(
//         taskId, 
//         'user123', 
//         true
//       );
      
//       // Verificar la respuesta
//       expect(response.body).toHaveProperty('message', 'Tarea marcada como completada exitosamente');
//       expect(response.body).toHaveProperty('task');
//       expect(response.body.task).toEqual(updatedTask);
//     });

//     it('debe retornar 400 si faltan datos requeridos', async () => {
//       // Datos incompletos (sin completed)
//       const incompleteData = {
//         userId: 'user123',
//       };
      
//       // Realizar la solicitud HTTP
//       const response = await request(app)
//         .patch(`/tasks/task123/toggle-completion`)
//         .send(incompleteData)
//         .expect('Content-Type', /json/)
//         .expect(400);
      
//       // Verificar que no se llamó al servicio
//       expect(mockTaskService.toggleTaskCompletion).not.toHaveBeenCalled();
      
//       // Verificar el mensaje de error
//       expect(response.body).toHaveProperty(
//         'message', 
//         'El ID de la tarea, el ID del usuario y el estado de completado son requeridos'
//       );
//     });
//   });
// });