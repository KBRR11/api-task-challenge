import { db } from '../utils/firebase';
import { Task } from '../models/task.model';
import { Timestamp } from 'firebase-admin/firestore';

export class TaskRepository {
  private tasksCollection = db.collection('tasks');

  /**
   * Obtiene todas las tareas de un usuario ordenadas por fecha de creación
   * @param userId ID del usuario
   * @returns Promise con array de tareas
   */
  async findAllByUserId(userId: string): Promise<Task[]> {
    try {
      const querySnapshot = await this.tasksCollection
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data() as Task;
        return {
          ...data,
          id: doc.id
        };
      });
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      throw new Error('Error al obtener tareas');
    }
  }

  /**
   * Crea una nueva tarea
   * @param task Datos de la tarea a crear
   * @returns Promise con la tarea creada
   */
  async create(task: Task): Promise<Task> {
    try {
      // Preparar datos de la tarea
      const taskData = {
        title: task.title,
        description: task.description || '',
        completed: task.completed || false,
        userId: task.userId,
        createdAt: task.createdAt || Timestamp.now()
      };
      
      let docRef;
      if (task.id) {
        // Si viene con ID, usamos ese ID específico
        docRef = this.tasksCollection.doc(task.id);
        await docRef.set(taskData);
        return {
          ...taskData,
          id: task.id
        }
      } else {
        // Si no tiene ID, dejamos que Firestore asigne uno
        docRef = await this.tasksCollection.add(taskData);
        return {
          ...taskData,
          id: docRef.id
        };
      }
      
      
      
    } catch (error) {
      console.error('Error al crear tarea:', error);
      throw new Error('Error al crear tarea');
    }
  }

  /**
   * Actualiza una tarea existente
   * @param id ID de la tarea
   * @param task Datos actualizados de la tarea
   * @returns Promise con la tarea actualizada
   */
  async update(id: string, task: Partial<Task>): Promise<Task> {
    try {
      const taskRef = this.tasksCollection.doc(id);
      
      // Verificamos que la tarea exista
      const taskDoc = await taskRef.get();
      if (!taskDoc.exists) {
        throw new Error('La tarea no existe');
      }
      
      // Actualizamos solo los campos proporcionados
      await taskRef.update(task);
      
      // Obtenemos la tarea actualizada
      const updatedTaskDoc = await taskRef.get();
      const updatedTask = updatedTaskDoc.data() as Task;
      
      return {
        ...updatedTask,
        id
      };
    } catch (error) {
      console.error('Error al actualizar tarea:', error);
      throw new Error('Error al actualizar tarea');
    }
  }

  /**
   * Elimina una tarea
   * @param id ID de la tarea a eliminar
   * @returns Promise<void>
   */
  async delete(id: string): Promise<void> {
    try {
      await this.tasksCollection.doc(id).delete();
    } catch (error) {
      console.error('Error al eliminar tarea:', error);
      throw new Error('Error al eliminar tarea');
    }
  }

  /**
   * Obtiene una tarea por su ID
   * @param id ID de la tarea
   * @returns Promise con la tarea si existe, null si no existe
   */
  async findById(id: string): Promise<Task | null> {
    try {
      const taskDoc = await this.tasksCollection.doc(id).get();
      
      if (!taskDoc.exists) {
        return null;
      }
      
      const taskData = taskDoc.data() as Task;
      
      return {
        ...taskData,
        id: taskDoc.id
      };
    } catch (error) {
      console.error('Error al obtener tarea por ID:', error);
      throw new Error('Error al obtener tarea por ID');
    }
  }
}