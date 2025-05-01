import {UserRepository} from "../../src/repositories/user.repository";
import {db} from "../../src/utils/firebase";
import {User} from "../../src/models/user.model";
import {Timestamp} from "firebase-admin/firestore";

// Mock de firebase-admin/firestore para manejar Timestamp
jest.mock("firebase-admin/firestore", () => {
  const mockTimestamp = {
    toDate: jest.fn().mockReturnValue(new Date("2023-01-01T10:00:00Z")),
    seconds: 1672567200,
    nanoseconds: 0,
    valueOf: jest.fn(),
    toJSON: jest.fn().mockReturnValue({seconds: 1672567200, nanoseconds: 0}),
    toMillis: jest.fn().mockReturnValue(1672567200000),
  };

  return {
    Timestamp: {
      now: jest.fn().mockReturnValue(mockTimestamp),
      fromDate: jest.fn().mockReturnValue(mockTimestamp),
    },
  };
});

// Mock manual de firebase
jest.mock("../../src/utils/firebase", () => ({
  db: {
    collection: jest.fn(),
  },
}));

describe("UserRepository", () => {
  let userRepository: UserRepository;
  let mockCollection: jest.Mock;
  let mockDoc: jest.Mock;
  let mockWhere: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockAdd: jest.Mock;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    // Configurar mocks para simular operaciones de Firestore
    mockGet = jest.fn();
    mockSet = jest.fn();
    mockAdd = jest.fn();
    mockDoc = jest.fn();
    mockWhere = jest.fn();
    mockDoc.mockReturnValue({
      get: mockGet,
      set: mockSet,
    });

    mockWhere.mockReturnValue({
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
    userRepository = new UserRepository();
  });

  describe("findByEmail", () => {
    it("debe retornar null cuando no se encuentra el usuario", async () => {
      // Configurar el mock para el caso negativo
      mockGet.mockResolvedValueOnce({
        empty: true,
        docs: [],
      });

      // Ejecutar el método
      const result = await userRepository.findByEmail("none@example.com");

      // Verificar las llamadas a Firestore
      expect(mockCollection).toHaveBeenCalledWith("users");
      expect(mockWhere).toHaveBeenCalledWith("email", "==", "none@example.com");
      expect(mockGet).toHaveBeenCalled();

      // Verificar el resultado
      expect(result).toBeNull();
    });

    it("debe retornar el usuario cuando se encuentra por email", async () => {
      // Datos de prueba
      const mockUser: User = {
        id: "user-id-1",
        email: "test@example.com",
        createdAt: Timestamp.now(),
      };

      // Configurar el mock para el caso positivo
      mockGet.mockResolvedValueOnce({
        empty: false,
        docs: [
          {
            id: mockUser.id,
            data: () => ({
              email: mockUser.email,
              createdAt: mockUser.createdAt,
            }),
          },
        ],
      });

      // Ejecutar el método
      const result = await userRepository.findByEmail("test@example.com");

      // Verificar las llamadas a Firestore
      expect(mockCollection).toHaveBeenCalledWith("users");
      expect(mockWhere).toHaveBeenCalledWith("email", "==", "test@example.com");
      expect(mockGet).toHaveBeenCalled();

      // Verificar el resultado
      expect(result).not.toBeNull();
      expect(result?.id).toBe("user-id-1");
      expect(result?.email).toBe("test@example.com");
    });

    it("debe manejar errores correctamente", async () => {
      // Configurar el mock para simular un error
      mockGet.mockRejectedValueOnce(new Error("Database error"));

      // Ejecutar el método y verificar que lanza error
      await expect(userRepository.findByEmail("test@example.com"))
        .rejects.toThrow("Error al buscar usuario por email");
    });
  });

  describe("create", () => {
    it("debe crear un usuario con ID generado automáticamente", async () => {
      // Obtener el Timestamp mockeado
      const mockTimestamp = Timestamp.now();

      // Datos de prueba
      const newUser: Omit<User, "id"> = {
        email: "new@example.com",
        createdAt: mockTimestamp,
      };

      // Configurar el mock para add (caso sin ID específico)
      mockAdd.mockResolvedValueOnce({id: "generated-id"});

      // Ejecutar el método
      const result = await userRepository.create(newUser as User);

      // Verificar las llamadas a Firestore
      expect(mockCollection).toHaveBeenCalledWith("users");
      expect(mockAdd).toHaveBeenCalledWith({
        email: newUser.email,
        createdAt: mockTimestamp,
      });

      // Verificar el resultado
      expect(result).toEqual({
        ...newUser,
        id: "generated-id",
      });
    });

    it("debe crear un usuario con ID específico si se proporciona", 
      async () => {
      // Obtener un mockTimestamp para una fecha fija
      const date = new Date("2023-01-01T10:00:00Z")
      const mockTimestamp = Timestamp.fromDate(date);

      // Datos de prueba con ID
      const userWithId: User = {
        id: "specific-id",
        email: "specific@example.com",
        createdAt: mockTimestamp,
      };

      // Configurar el mock para set (caso con ID específico)
      mockSet.mockResolvedValueOnce(undefined);

      // Ejecutar el método
      const result = await userRepository.create(userWithId);

      // Verificar las llamadas a Firestore
      expect(mockCollection).toHaveBeenCalledWith("users");
      expect(mockDoc).toHaveBeenCalledWith("specific-id");
      expect(mockSet).toHaveBeenCalledWith({
        email: userWithId.email,
        createdAt: mockTimestamp,
      });

      // Verificar el resultado
      expect(result.id).toBe("specific-id");
    });

    it("debe manejar errores correctamente", async () => {
      // Datos de prueba
      const newUser: User = {
        id: "test-id",
        email: "test@example.com",
        createdAt: Timestamp.now(),
      };

      // Configurar el mock para lanzar error
      mockSet.mockRejectedValueOnce(new Error("Database error"));

      // Verificar que se lance una excepción apropiada
      await expect(userRepository.create(newUser))
        .rejects.toThrow("Error al crear usuario");
    });
  });

  describe("findById", () => {
    it("debe retornar null cuando no se encuentra el usuario por ID", 
      async () => {
      // Configurar el mock para el caso negativo
      mockGet.mockResolvedValueOnce({
        exists: false,
        data: () => null,
      });

      // Ejecutar el método
      const result = await userRepository.findById("nonexistent-id");

      // Verificar las llamadas a Firestore
      expect(mockCollection).toHaveBeenCalledWith("users");
      expect(mockDoc).toHaveBeenCalledWith("nonexistent-id");
      expect(mockGet).toHaveBeenCalled();

      // Verificar el resultado
      expect(result).toBeNull();
    });

    it("debe retornar el usuario cuando se encuentra por ID", async () => {
      // Datos de prueba
      const mockUser: User = {
        id: "existing-id",
        email: "existing@example.com",
        createdAt: Timestamp.now(),
      };

      // Configurar el mock para el caso positivo
      mockGet.mockResolvedValueOnce({
        exists: true,
        id: mockUser.id,
        data: () => ({
          email: mockUser.email,
          createdAt: mockUser.createdAt,
        }),
      });

      // Ejecutar el método
      const result = await userRepository.findById("existing-id");

      // Verificar las llamadas a Firestore
      expect(mockCollection).toHaveBeenCalledWith("users");
      expect(mockDoc).toHaveBeenCalledWith("existing-id");
      expect(mockGet).toHaveBeenCalled();
      // Verificar el resultado
      expect(result).not.toBeNull();
      expect(result?.id).toBe("existing-id");
      expect(result?.email).toBe("existing@example.com");
    });

    it("debe manejar errores correctamente", async () => {
      // Configurar el mock para simular un error
      mockGet.mockRejectedValueOnce(new Error("Database error"));
      // Verificar que se lance una excepción apropiada
      await expect(userRepository.findById("some-id"))
        .rejects.toThrow("Error al obtener usuario por ID");
    });
  });
});