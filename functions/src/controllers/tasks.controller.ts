import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto';
import { UserService } from '../services/user.service';
import { handleError } from '../utils/error-handler';
import { HttpException } from '../common/exceptions/http-exception';

export class TasksController {
  private taskService: TaskService;
  private userService: UserService;

  constructor() {
    this.taskService = new TaskService();
    this.userService = new UserService(); 
  }

  /**
   * Obtiene todas las tareas del usuario autenticado
   * @param req Request con userId desde el token JWT
   * @param res Response
   */
  getAllTasksByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.userId; 
      
      if (!userId) {
        throw new HttpException('El ID del usuario es requerido', 400);
      }
      
      const tasks = await this.taskService.getAllTasksByUserId(userId);
      
      res.status(200).json({ tasks });
    } catch (error) {
      handleError(error, res);
    }
  };

  /**
   * Crea una nueva tarea para el usuario autenticado
   * @param req Request con datos de la tarea y userId del token JWT
   * @param res Response
   */
  createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description } = req.body;
      const userId = req.userId; // Obtenido del token JWT
      
      if (!title || !userId) {
        throw new HttpException('El título y el ID del usuario son requeridos', 400);
      }

      const user = await this.userService.findById(userId);
      
      if(!user){
        throw new HttpException('Usuario no encontrado', 404);
      }
      
      const createTaskDto: CreateTaskDto = {
        title,
        description: description || '',
        userId
      };
      
      const newTask = await this.taskService.createTask(createTaskDto);
      
      res.status(201).json({
        message: 'Tarea creada exitosamente',
        task: newTask
      });
    } catch (error) {
      handleError(error, res);
    }
  };

  /**
   * Actualiza una tarea existente del usuario autenticado
   * @param req Request con ID de tarea y datos a actualizar
   * @param res Response
   */
  updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, completed } = req.body;
      const userId = req.userId; 
      
      if (!id || !userId) {
        throw new HttpException('El ID de la tarea y el ID del usuario son requeridos', 400);
      }

      const user = await this.userService.findById(userId);

      if(!user){
        throw new HttpException('Usuario no encontrado', 404);
      }

      const task = await this.taskService.getTaskById(id);

      if(!task){
        throw new HttpException('Tarea no encontrada', 404);
      }
      
      // Verificar que la tarea pertenezca al usuario autenticado
      if (task.userId !== userId) {
        throw new HttpException('No tienes permiso para modificar esta tarea', 403);
      }
      
      const updateTaskDto: UpdateTaskDto = {
        userId
      };
      
      if (title !== undefined) {
        updateTaskDto.title = title;
      }
      
      if (description !== undefined) {
        updateTaskDto.description = description;
      }
      
      if (completed !== undefined) {
        updateTaskDto.completed = completed;
      }
      
      const updatedTask = await this.taskService.updateTask(id, updateTaskDto);
      
      res.status(200).json({
        message: 'Tarea actualizada exitosamente',
        task: updatedTask
      });
    } catch (error) {
      handleError(error, res);
    }
  };

  /**
   * Elimina una tarea del usuario autenticado
   * @param req Request con ID de tarea y userId del token JWT
   * @param res Response
   */
  deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.userId; // Obtenido del token JWT
      
      if (!id || !userId) {
        throw new HttpException('El ID de la tarea y el ID del usuario son requeridos', 400);
      }
      
      // Verificar que la tarea exista y pertenezca al usuario
      const task = await this.taskService.getTaskById(id);
      
      if (!task) {
        throw new HttpException('Tarea no encontrada', 404);
      }
      
      if (task.userId !== userId) {
        throw new HttpException('No tienes permiso para eliminar esta tarea', 403);
      }
      
      await this.taskService.deleteTask(id, userId);
      
      res.status(200).json({
        message: 'Tarea eliminada exitosamente'
      });
    } catch (error) {
      handleError(error, res);
    }
  };

  /**
   * Marca una tarea como completada o pendiente para el usuario autenticado
   * @param req Request con ID de tarea, userId del token JWT y completed
   * @param res Response
   */
  toggleTaskCompletion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { completed } = req.body;
      const userId = req.userId; // Obtenido del token JWT
      
      if (!id || !userId || completed === undefined) {
        throw new HttpException('El ID de la tarea, el ID del usuario y el estado de completado son requeridos', 400);
      }
      
      // Verificar que la tarea exista y pertenezca al usuario
      const task = await this.taskService.getTaskById(id);
      
      if (!task) {
        throw new HttpException('Tarea no encontrada', 404);
      }
      
      if (task.userId !== userId) {
        throw new HttpException('No tienes permiso para modificar esta tarea', 403);
      }
      
      const updatedTask = await this.taskService.toggleTaskCompletion(id, userId, completed);
      
      res.status(200).json({
        message: `Tarea marcada como ${completed ? 'completada' : 'pendiente'} exitosamente`,
        task: updatedTask
      });
    } catch (error) {
      handleError(error, res);
    }
  };

  /**
   * Obtiene una tarea por su ID si pertenece al usuario autenticado
   * @param req Request con ID de tarea y userId del token JWT
   * @param res Response
   */
  getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.userId; // Obtenido del token JWT
      
      if (!id) {
        throw new HttpException('El ID de la tarea es requerido', 400);
      }
      
      const task = await this.taskService.getTaskById(id);
      
      if (!task) {
        throw new HttpException('Tarea no encontrada', 404);
      }
      
      // Verificar que la tarea pertenezca al usuario autenticado
      if (task.userId !== userId) {
        throw new HttpException('No tienes permiso para acceder a esta tarea', 403);
      }
      
      res.status(200).json({ task });
    } catch (error) {
      handleError(error, res);
    }
  };
}