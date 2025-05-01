import { TaskRepository } from '../repositories/task.repository';
import { Task } from '../models/task.model';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

export class TaskService {
  private taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  /**
   * Obtiene todas las tareas de un usuario
   * @param userId ID del usuario
   * @returns Promise con array de tareas
   */
  async getAllTasksByUserId(userId: string): Promise<Task[]> {
    return this.taskRepository.findAllByUserId(userId);
  }

  /**
   * Crea una nueva tarea
   * @param createTaskDto DTO con los datos para crear la tarea
   * @returns Promise con la tarea creada
   */
  async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const newTask: Task = {
      id: uuidv4(),  
      title: createTaskDto.title,
      description: createTaskDto.description,
      completed: false,
      userId: createTaskDto.userId,
      createdAt: Timestamp.now()
    };

    return this.taskRepository.create(newTask);
  }

  /**
   * Actualiza una tarea existente
   * @param id ID de la tarea
   * @param updateTaskDto DTO con los datos para actualizar la tarea
   * @returns Promise con la tarea actualizada
   */
  async updateTask(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    // Verificamos que la tarea exista y pertenezca al usuario
    const task = await this.taskRepository.findById(id);
    
    if (!task) {
      throw new Error('Tarea no encontrada');
    }
    
    if (task.userId !== updateTaskDto.userId) {
      throw new Error('No tienes permiso para modificar esta tarea');
    }
    
    // Preparamos los datos a actualizar
    const updateData: Partial<Task> = {};
    
    if (updateTaskDto.title !== undefined) {
      updateData.title = updateTaskDto.title;
    }
    
    if (updateTaskDto.description !== undefined) {
      updateData.description = updateTaskDto.description;
    }
    
    if (updateTaskDto.completed !== undefined) {
      updateData.completed = updateTaskDto.completed;
    }
    
    return this.taskRepository.update(id, updateData);
  }

  /**
   * Elimina una tarea
   * @param id ID de la tarea
   * @param userId ID del usuario (para verificar permisos)
   * @returns Promise<void>
   */
  async deleteTask(id: string, userId: string): Promise<void> {
    // Verificamos que la tarea exista y pertenezca al usuario
    const task = await this.taskRepository.findById(id);
    
    if (!task) {
      throw new Error('Tarea no encontrada');
    }
    
    if (task.userId !== userId) {
      throw new Error('No tienes permiso para eliminar esta tarea');
    }
    
    await this.taskRepository.delete(id);
  }

  /**
   * Marca una tarea como completada o pendiente
   * @param id ID de la tarea
   * @param userId ID del usuario (para verificar permisos)
   * @param completed Estado de completado
   * @returns Promise con la tarea actualizada
   */
  async toggleTaskCompletion(id: string, userId: string, completed: boolean): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    
    if (!task) {
      throw new Error('Tarea no encontrada');
    }
    
    if (task.userId !== userId) {
      throw new Error('No tienes permiso para modificar esta tarea');
    }
    
    return this.taskRepository.update(id, { completed });
  }

  /**
   * Obtiene una tarea por su ID
   * @param id ID de la tarea
   * @returns Promise con la tarea si existe, null si no existe
   */
  async getTaskById(id: string): Promise<Task | null> {
    return this.taskRepository.findById(id);
  }
}