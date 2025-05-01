import {TaskRepository} from "../../src/repositories/task.repository";
import {db} from "../../src/utils/firebase";
import {Task} from "../../src/models/task.model";
import {Timestamp} from "firebase-admin/firestore";

// Mock de firebase-admin/firestore
jest.mock("firebase-admin/firestore", () => {
  return {
    Timestamp: {
      now: jest.fn().mockReturnValue({
        toDate: jest.fn().mockReturnValue(new Date("2023-01-01T10:00:00Z")),
        seconds: 1672567200,
        nanoseconds: 0,
      }),
    },
  };
});

// Mock manual de firebase
jest.mock("../../src/utils/firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe("TaskRepository", () => {
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
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockSet = jest.fn();
    mockUpdate = jest.fn();
    mockDelete = jest.fn();
    mockAdd = jest.fn();
    mockDoc = jest.fn();
    mockWhere = jest.fn();
    mockOrderBy = jest.fn();

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

    (db.collection as jest.Mock).mockImplementation(mockCollection);

    taskRepository = new TaskRepository();
  });

  describe("findAllByUserId", () => {
    it("debe retornar un array de tareas para un userId", async () => {
      const mockTasks = [
        {
          id: "task1",
          title: "Task 1",
          completed: false,
          userId: "user1",
          createdAt: "2023-01-01",
        },
        {
          id: "task2",
          title: "Task 2",
          completed: true,
          userId: "user1",
          createdAt: "2023-01-02",
        },
      ];

      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: mockTasks.map((task) => ({
          id: task.id,
          data: () => ({...task}),
        })),
      });

      const result = await taskRepository.findAllByUserId("user1");

      expect(mockCollection).toHaveBeenCalledWith("tasks");
      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "user1");
      expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(mockGet).toHaveBeenCalled();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("task1");
      expect(result[1].id).toBe("task2");
    });

    it("debe retornar un array vacío cuando no hay tareas", async () => {
      mockGet.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      const result = await taskRepository.findAllByUserId("user1");

      expect(mockCollection).toHaveBeenCalledWith("tasks");
      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "user1");
      expect(mockOrderBy).toHaveBeenCalledWith("createdAt", "desc");
      expect(mockGet).toHaveBeenCalled();

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it("debe manejar errores correctamente", async () => {
      mockGet.mockRejectedValueOnce(new Error("Database error"));

      await expect(taskRepository.findAllByUserId("user1"))
        .rejects.toThrow("Error al obtener tareas");

      expect(mockCollection).toHaveBeenCalledWith("tasks");
      expect(mockWhere).toHaveBeenCalledWith("userId", "==", "user1");
    });
  });

  describe("create", () => {
    it("debe crear una tarea con los datos correctos", async () => {
      const mockTimestamp = Timestamp.now();

      const newTask: Partial<Task> = {
        title: "Nueva Tarea",
        description: "Descripción de la tarea",
        userId: "user1",
        createdAt: mockTimestamp,
      };

      mockAdd.mockResolvedValueOnce({id: "new-task-id"});

      const result = await taskRepository.create(newTask as Task);

      expect(mockCollection).toHaveBeenCalledWith("tasks");
      expect(mockAdd).toHaveBeenCalledWith(expect.objectContaining({
        title: "Nueva Tarea",
        description: "Descripción de la tarea",
        userId: "user1",
        completed: false,
        createdAt: mockTimestamp,
      }));

      expect(result).toEqual(expect.objectContaining({
        id: "new-task-id",
        title: "Nueva Tarea",
        description: "Descripción de la tarea",
        userId: "user1",
        completed: false,
        createdAt: mockTimestamp,
      }));
    });

    it("debe crear una tarea con ID específico si se proporciona", async () => {
      const mockTimestamp = Timestamp.now();

      const taskWithId: Task = {
        id: "specific-id",
        title: "Tarea con ID",
        description: "Descripción",
        userId: "user1",
        completed: false,
        createdAt: mockTimestamp,
      };

      mockSet.mockResolvedValueOnce(undefined);

      const result = await taskRepository.create(taskWithId);

      expect(mockCollection).toHaveBeenCalledWith("tasks");
      expect(mockDoc).toHaveBeenCalledWith("specific-id");
      expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
        title: "Tarea con ID",
        description: "Descripción",
        userId: "user1",
        completed: false,
        createdAt: mockTimestamp,
      }));

      expect(result).toEqual(expect.objectContaining({
        id: "specific-id",
        title: "Tarea con ID",
        description: "Descripción",
        userId: "user1",
        completed: false,
        createdAt: mockTimestamp,
      }));
    });
  });
});
