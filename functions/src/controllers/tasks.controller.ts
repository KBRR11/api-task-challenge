import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto';
import { UserService } from '../services/user.service';

export class TasksController {
  private taskService: TaskService;
  private userService: UserService;

  constructor() {
    this.taskService = new TaskService();
    this.userService = new UserService(); 
  }

  /**
   * Obtiene todas las tareas de un usuario
   * @param req Request con userId en params
   * @param res Response
   */
  getAllTasksByUserId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(400).json({ message: 'El ID del usuario es requerido' });
        return;
      }
      
      const tasks = await this.taskService.getAllTasksByUserId(userId);
      
      res.status(200).json({ tasks });
    } catch (error) {
      console.error('Error en getAllTasksByUserId:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message: 'Error al obtener tareas', error: message });
    }
  };

  /**
   * Crea una nueva tarea
   * @param req Request con datos de la tarea
   * @param res Response
   */
  createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { title, description, userId } = req.body;
      
      if (!title || !userId) {
        res.status(400).json({ message: 'El título y el ID del usuario son requeridos' });
        return;
      }

      const user = await this.userService.findById(userId);
      
      if(!user){
        res.status(404).json({ message: 'Usuario no encontrado' });
        return; 
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
      console.error('Error en createTask:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message: 'Error al crear tarea', error: message });
    }
  };

  /**
   * Actualiza una tarea existente
   * @param req Request con ID de tarea y datos a actualizar
   * @param res Response
   */
  updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { title, description, completed, userId } = req.body;
      
      if (!id || !userId) {
        res.status(400).json({ message: 'El ID de la tarea y el ID del usuario son requeridos' });
        return;
      }

      const user = await this.userService.findById(userId);

      if(!user){
        res.status(404).json({ message: 'Usuario no encontrado' });
        return; 
      }

      const task = await this.taskService.getTaskById(id);

      if(!task){
        res.status(404).json({ message: 'Tarea no encontrada' });
        return; 
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
      console.error('Error en updateTask:', error);
      
      const message = error instanceof Error ? error.message : 'Error desconocido';

      if (message === 'Tarea no encontrada' || message === 'No tienes permiso para modificar esta tarea') {
        res.status(404).json({ message: message });
        return;
      }
      
      res.status(500).json({ message: 'Error al actualizar tarea', error: message });
    }
  };

  /**
   * Elimina una tarea
   * @param req Request con ID de tarea y userId
   * @param res Response
   */
  deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      
      if (!id || !userId) {
        res.status(400).json({ message: 'El ID de la tarea y el ID del usuario son requeridos' });
        return;
      }
      
      await this.taskService.deleteTask(id, userId);
      
      res.status(200).json({
        message: 'Tarea eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error en deleteTask:', error);
      
      const message = error instanceof Error ? error.message : 'Error desconocido';

      if (message === 'Tarea no encontrada') {
        res.status(404).json({ message: message });
        return;
      }

      if (message === 'No tienes permiso para eliminar esta tarea') {
        res.status(401).json({ message: message });
        return;
      }
      
      res.status(500).json({ message: 'Error al eliminar tarea', error: message });
    }
  };

  /**
   * Marca una tarea como completada o pendiente
   * @param req Request con ID de tarea, userId y completed
   * @param res Response
   */
  toggleTaskCompletion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { userId, completed } = req.body;
      
      if (!id || !userId || completed === undefined) {
        res.status(400).json({ 
          message: 'El ID de la tarea, el ID del usuario y el estado de completado son requeridos'
        });
        return;
      }
      
      const updatedTask = await this.taskService.toggleTaskCompletion(id, userId, completed);
      
      res.status(200).json({
        message: `Tarea marcada como ${completed ? 'completada' : 'pendiente'} exitosamente`,
        task: updatedTask
      });
    } catch (error) {
      console.error('Error en toggleTaskCompletion:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      if (message === 'Tarea no encontrada' || message === 'No tienes permiso para modificar esta tarea') {
        res.status(404).json({ message: message });
        return;
      }
      
      res.status(500).json({ 
        message: 'Error al cambiar estado de la tarea', 
        error: message 
      });
    }
  };

  /**
   * Obtiene una tarea por su ID
   * @param req Request con ID de tarea
   * @param res Response
   */
  getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({ message: 'El ID de la tarea es requerido' });
        return;
      }
      
      const task = await this.taskService.getTaskById(id);
      
      if (!task) {
        res.status(404).json({ message: 'Tarea no encontrada' });
        return;
      }
      
      res.status(200).json({ task });
    } catch (error) {
      console.error('Error en getTaskById:', error);
      const message = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ message: 'Error al obtener tarea', error: message });
    }
  };
}