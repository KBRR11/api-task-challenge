import {UserService} from "../../src/services/user.service";
import {UserRepository} from "../../src/repositories/user.repository";
import {User} from "../../src/models/user.model";
import {CreateUserDto} from "../../src/dtos/user.dto";
import {Timestamp} from "firebase-admin/firestore";

// Mock del repositorio de usuarios
jest.mock("../../src/repositories/user.repository");

// Mock de firebase-admin/firestore para Timestamp
jest.mock("firebase-admin/firestore", () => {
  const mockTimestamp = {
    toDate: jest.fn().mockReturnValue(new Date("2023-01-01T10:00:00Z")),
    seconds: 1672567200,
    nanoseconds: 0,
    valueOf: jest.fn(),
    toJSON: jest.fn().mockReturnValue({
      seconds: 1672567200,
      nanoseconds: 0,
    }),
    toMillis: jest.fn().mockReturnValue(1672567200000),
  };

  return {
    Timestamp: {
      now: jest.fn().mockReturnValue(mockTimestamp),
      fromDate: jest.fn().mockReturnValue(mockTimestamp),
    },
  };
});

// Mock de uuid
jest.mock("uuid", () => ({
  v4: jest.fn().mockReturnValue("mocked-uuid"),
}));

describe("UserService", () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepository = new UserRepository() as jest.Mocked<UserRepository>;
    (UserRepository as jest.Mock).mockImplementation(() => mockUserRepository);
    userService = new UserService();
  });

  describe("findByEmail", () => {
    it("debe retornar null cuando el usuario no existe", async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce(null);

      const result = await userService.findByEmail("nonexistent@example.com");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "nonexistent@example.com"
      );
      expect(result).toBeNull();
    });

    it("debe retornar el usuario cuando existe", async () => {
      const mockUser: User = {
        id: "user-id-1",
        email: "test@example.com",
        createdAt: Timestamp.now(),
      };

      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);

      const result = await userService.findByEmail("test@example.com");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "test@example.com"
      );
      expect(result).toEqual(mockUser);
    });

    it("debe propagar errores del repositorio", async () => {
      mockUserRepository.findByEmail.mockRejectedValueOnce(
        new Error("Database error")
      );

      await expect(userService.findByEmail("test@example.com")).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("createUser", () => {
    it("debe crear un nuevo usuario correctamente", async () => {
      const createUserDto: CreateUserDto = {
        email: "new@example.com",
      };

      const mockTimestamp = Timestamp.now();

      const expectedNewUser: User = {
        id: "mocked-uuid",
        email: "new@example.com",
        createdAt: mockTimestamp,
      };

      mockUserRepository.findByEmail.mockResolvedValueOnce(null);
      mockUserRepository.create.mockResolvedValueOnce(expectedNewUser);

      const result = await userService.createUser(createUserDto);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "new@example.com"
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "mocked-uuid",
          email: "new@example.com",
          createdAt: mockTimestamp,
        })
      );
      expect(result).toEqual(expectedNewUser);
    });

    it("debe lanzar error si el usuario ya existe", async () => {
      const createUserDto: CreateUserDto = {
        email: "existing@example.com",
      };

      const existingUser: User = {
        id: "existing-id",
        email: "existing@example.com",
        createdAt: Timestamp.now(),
      };

      mockUserRepository.findByEmail.mockResolvedValueOnce(existingUser);

      await expect(userService.createUser(createUserDto)).rejects.toThrow(
        "El usuario con este correo ya existe"
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "existing@example.com"
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("findOrCreateUser", () => {
    it("debe retornar usuario existente sin crear uno nuevo", async () => {
      const existingUser: User = {
        id: "existing-id",
        email: "existing@example.com",
        createdAt: Timestamp.now(),
      };

      mockUserRepository.findByEmail.mockResolvedValueOnce(existingUser);

      const result = await userService.findOrCreateUser("existing@example.com");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "existing@example.com"
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
      expect(result).toEqual(existingUser);
    });

    it("debe crear un nuevo usuario si no existe", async () => {
      const mockTimestamp = Timestamp.now();

      const createdUser: User = {
        id: "mocked-uuid",
        email: "new@example.com",
        createdAt: mockTimestamp,
      };

      mockUserRepository.findByEmail.mockResolvedValueOnce(null);
      mockUserRepository.create.mockResolvedValueOnce(createdUser);

      const result = await userService.findOrCreateUser("new@example.com");

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        "new@example.com"
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "mocked-uuid",
          email: "new@example.com",
          createdAt: mockTimestamp,
        })
      );
      expect(result).toEqual(createdUser);
    });
  });

  describe("findById", () => {
    it("debe retornar null cuando el usuario no existe", async () => {
      mockUserRepository.findById.mockResolvedValueOnce(null);
      const result = await userService.findById("none-id");
      expect(mockUserRepository.findById).toHaveBeenCalledWith("none-id");
      expect(result).toBeNull();
    });

    it("debe retornar el usuario cuando existe", async () => {
      const mockUser: User = {
        id: "user-id-2",
        email: "found@example.com",
        createdAt: Timestamp.now(),
      };

      mockUserRepository.findById.mockResolvedValueOnce(mockUser);

      const result = await userService.findById("user-id-2");

      expect(mockUserRepository.findById).toHaveBeenCalledWith("user-id-2");
      expect(result).toEqual(mockUser);
    });

    it("debe propagar errores del repositorio", async () => {
      mockUserRepository.findById.mockRejectedValueOnce(
        new Error("Database error")
      );

      await expect(userService.findById("user-id")).rejects.toThrow(
        "Database error"
      );
    });
  });
});
