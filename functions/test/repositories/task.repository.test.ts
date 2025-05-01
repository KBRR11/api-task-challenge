import { TaskRepository } from '../../src/repositories/task.repository';
import { db } from '../../src/utils/firebase';
import { Task } from '../../src/models/task.model';
import { Timestamp } from 'firebase-admin/firestore';

// Mock de firebase-admin/firestore para manejar Timestamp
jest.mock('firebase-admin/firestore', () => {
  const mockTimestamp = {
    toDate: jest.fn().mockReturnValue(new Date('2023-01-01T10:00:00Z')),
    seconds: 1672567200,
    nanoseconds: 0,
    valueOf: jest.fn(),
    toJSON: jest.fn().mockReturnValue({ seconds: 1672567200, nanoseconds: 0 }),
    toMillis: jest.fn().mockReturnValue(1672567200000),
  };
  
  return {
    Timestamp: {
      now: jest.fn().mockReturnValue(mockTimestamp),
      fromDate: jest.fn().mockReturnValue(mockTimestamp)
    }
  };
});

// Mock manual de firebase
jest.mock('../../src/utils/firebase', () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe('TaskRepository', () => {
  let taskRepository: TaskRepository;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockUpdate: jest.Mock;
  let mockDelete: jest.Mock;
  let mockAdd: jest.Mock;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    
    // Configurar mocks para simular operaciones de Firestore
    mockGet = jest.fn();
    mockSet = jest.fn();
    mockUpdate = jest.fn();
    mockDelete = jest.fn();
    mockAdd = jest.fn();
    mockDoc = jest.fn();
    mockWhere = jest.fn();
    mockOrderBy = jest.fn();
    
    // Configurar comportamiento de retorno para cadenas de métodos
    mockDoc.mockReturnValue({
      get: mockGet,
      set: mockSet,
      update: mockUpdate,
      delete: mockDelete,
    });
    
    mockWhere.mockReturnValue({
      orderBy: mockOrderBy,
      get: mockGet,
    });
    
    mockOrderBy.mockReturnValue({
      get: mockGet,
    });
    
    mockCollection = jest.fn().mockReturnValue({
      doc: mockDoc,
      where: mockWhere,
      add: mockAdd,
    });
    
    // Asignar el mock collection a db.collection
    (db.collection as jest.Mock).mockImplementation(mockCollection);
    
    // Inicializar el repositorio con mocks configurados
    taskRepository = new TaskRepository();
  });

  describe('findAllByUserId', () => {
    it('debe retornar un array de tareas para un userId', async () => {
      // Datos de prueba
      const mockTasks = [
        { id: 'task1', title: 'Task 1', completed: false, userId: 'user1', createdAt: '2023-01-01' },
        { id: 'task2', title: 'Task 2', completed: true, userId: 'user1', createdAt: '2023-01-02' },
      ];
      
      // Configurar el mock para el caso positivo
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: mockTasks.map(task => ({
          id: task.id,
          data: () => ({ ...task }),
        })),
      });
      
      // Ejecutar el método
      const result = await taskRepository.findAllByUserId('user1');
      
      // Verificar las llamadas a Firestore
      expect(mockCollection).toHaveBeenCalledWith('tasks');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user1');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockGet).toHaveBeenCalled();
      
      // Verificar el resultado
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('task1');
      expect(result[1].id).toBe('task2');
    });

    it('debe retornar un array vacío cuando no hay tareas', async () => {
      // Configurar el mock para el caso sin resultados
      mockGet.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });
      
      // Ejecutar el método
      const result = await taskRepository.findAllByUserId('user1');
      
      // Verificar las llamadas a Firestore
      expect(mockCollection).toHaveBeenCalledWith('tasks');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user1');
      expect(mockOrderBy).toHaveBeenCalledWith('createdAt', 'desc');
      expect(mockGet).toHaveBeenCalled();
      
      // Verificar el resultado
      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('debe manejar errores correctamente', async () => {
      // Configurar el mock para simular un error
      mockGet.mockRejectedValueOnce(new Error('Database error'));
      
      // Ejecutar el método y verificar que lanza error
      await expect(taskRepository.findAllByUserId('user1'))
        .rejects.toThrow('Error al obtener tareas');
      
      // Verificar que se intentó hacer la consulta
      expect(mockCollection).toHaveBeenCalledWith('tasks');
      expect(mockWhere).toHaveBeenCalledWith('userId', '==', 'user1');
    });
  });

  describe('create', () => {
    it('debe crear una tarea con los datos correctos', async () => {
      // Obtener el Timestamp mockeado
      const mockTimestamp = Timestamp.now();
      
      // Datos de prueba
      const newTask: Partial<Task> = {
        title: 'Nueva Tarea',
        description: 'Descripción de la tarea',
        userId: 'user1',
      };
      
      // Configurar el mock para add (caso sin ID específico)
      mockAdd.mockResolvedValueOnce({ id: 'new-task-id' });
      
      // Ejecutar el método
      const result = await taskRepository.create(newTask as Task);
      
      // Verificar las llamadas a Firestore
      expect(mockCollection).toHaveBeenCalledWith('tasks');
      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Nueva Tarea',
        description: 'Descripción de la tarea',
        userId: 'user1',
        completed: false,
        // No verificamos exactamente createdAt porque puede ser complicado comparar objetos Timestamp
      }));
      
      // Verificar el resultado
      expect(result).toEqual(expect.objectContaining({
        id: 'new-task-id',
        title: 'Nueva Tarea',
        description: 'Descripción de la tarea',
        userId: 'user1',
        completed: false
        // No verificamos exactamente createdAt
      }));
    });

    it('debe crear una tarea con ID específico si se proporciona', async () => {
      // Obtener un mockTimestamp para una fecha fija
      const mockTimestamp = Timestamp.fromDate(new Date('2023-01-01T10:00:00Z'));
      
      // Datos de prueba con ID
      const taskWithId: Task = {
        id: 'specific-id',
        title: 'Tarea con ID',
        description: 'Descripción',
        userId: 'user1',
        completed: false,
        createdAt: mockTimestamp
      };
      
      // Configurar el mock para set (caso con ID específico)
      mockSet.mockResolvedValueOnce(undefined);
      
      // Ejecutar el método
      const result = await taskRepository.create(taskWithId);
      
      // Verificar las llamadas a Firestore
      expect(mockCollection).toHaveBeenCalledWith('tasks');
      expect(mockDoc).toHaveBeenCalledWith('specific-id');
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Tarea con ID',
        description: 'Descripción',
        userId: 'user1',
        completed: false,
        createdAt: mockTimestamp
      }));
      
      // Verificar el resultado
      expect(result.id).toBe('specific-id');
    });
  });

  // Aquí puedes añadir pruebas para otros métodos: update, delete, findById
});