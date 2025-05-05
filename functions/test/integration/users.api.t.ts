// import request from 'supertest';
// import app from '../../src/main';
// import { UserService } from '../../src/services/user.service';
// import { Timestamp } from 'firebase-admin/firestore';

// // Mock de Firebase Admin
// jest.mock('firebase-admin', () => {
//   const firestore = () => ({
//     collection: jest.fn().mockReturnThis(),
//     doc: jest.fn().mockReturnThis(),
//     where: jest.fn().mockReturnThis(),
//     get: jest.fn(),
//     set: jest.fn(),
//     add: jest.fn(),
//     update: jest.fn(),
//     delete: jest.fn(),
//   });
  
//   return {
//     initializeApp: jest.fn(),
//     firestore: jest.fn().mockImplementation(firestore),
//     Timestamp: {
//       now: jest.fn().mockReturnValue({ seconds: 1619712000, nanoseconds: 0 })
//     }
//   };
// });

// // Inicializar mock global de UserService
// jest.mock('../../src/services/user.service');

// describe('API Tests de Integración', () => {
//   let mockUserService: jest.Mocked<UserService>;

//   beforeAll(() => {
//     // Configurar el mock del servicio de usuarios
//     mockUserService = new UserService() as jest.Mocked<UserService>;
//     (UserService as jest.Mock).mockImplementation(() => mockUserService);
//   });

//   beforeEach(() => {
//     // Limpiar todos los mocks antes de cada prueba
//     jest.clearAllMocks();
//   });

//   describe('Rutas de Estado de Salud', () => {
//     it('GET /health debería devolver estado 200', async () => {
//       const response = await request(app).get('/health');
//       expect(response.status).toBe(200);
//       expect(response.body).toHaveProperty('status', 'ok');
//       expect(response.body).toHaveProperty('timestamp');
//     });

//     it('GET / debería devolver mensaje de bienvenida', async () => {
//       const response = await request(app).get('/');
//       expect(response.status).toBe(200);
//       expect(response.body).toHaveProperty('message', 'Bienvenido a la API de Tareas');
//       expect(response.body).toHaveProperty('documentation', '/api-docs');
//     });
//   });

//   describe('Rutas de Usuarios', () => {
//     // it('GET /users/by-email debería devolver 400 cuando falta email', async () => {
//     //   const response = await request(app).get('/users/by-email');
//     //   expect(response.status).toBe(400);
//     //   expect(response.body).toHaveProperty('message', 'El email es requerido');
//     // });

//     // it('GET /users/by-email debería devolver 404 cuando el usuario no existe', async () => {
//     //   // Mock del servicio para devolver null (usuario no existe)
//     //   mockUserService.findByEmail.mockResolvedValueOnce(null);

//     //   const response = await request(app).get('/users/by-email').query({ email: 'nonexistent@example.com' });
//     //   expect(response.status).toBe(404);
//     //   expect(response.body).toHaveProperty('message', 'Usuario no encontrado');
//     //   expect(response.body).toHaveProperty('exists', false);
//     // });

//     // it('GET /users/by-email debería devolver 200 y el usuario cuando existe', async () => {
//     //   // Mock del servicio para devolver un usuario
//     //   const mockUser = {
//     //     id: 'test-id',
//     //     email: 'test@example.com',
//     //     createdAt: Timestamp.now()
//     //   };
//     //   mockUserService.findByEmail.mockResolvedValueOnce(mockUser);

//     //   const response = await request(app).get('/users/by-email').query({ email: 'test@example.com' });
//     //   expect(response.status).toBe(200);
//     //   expect(response.body).toHaveProperty('user');
//     //   expect(response.body.user).toHaveProperty('id', 'test-id');
//     //   expect(response.body.user).toHaveProperty('email', 'test@example.com');
//     //   expect(response.body).toHaveProperty('exists', true);
//     // });

//     it('POST /users/ debería devolver 400 cuando falta email', async () => {
//       const response = await request(app).post('/users/').send({});
//       expect(response.status).toBe(400);
//       expect(response.body).toHaveProperty('message', 'El email es requerido');
//     });

//     it('POST /users/ debería devolver 409 cuando el usuario ya existe', async () => {
//       // Mock del servicio para devolver un usuario existente
//       const existingUser = {
//         id: 'existing-id',
//         email: 'existing@example.com',
//         createdAt: Timestamp.now()
//       };

//       mockUserService.findByEmail.mockResolvedValueOnce(existingUser);
      
//       const response = await request(app).post('/users/').send({ email: 'existing@example.com' });
//       expect(response.status).toBe(409);
//       expect(response.body).toHaveProperty('message', 'Ya existe un usuario con este email');
//       expect(response.body).toHaveProperty('user');
//       expect(response.body.user).toHaveProperty('id', 'existing-id');
//     });

//     it('POST /users/ debería devolver 201 cuando se crea un nuevo usuario', async () => {
//       // Mock del servicio para crear un nuevo usuario
//       const newUser = {
//         id: 'new-id',
//         email: 'new@example.com',
//         createdAt: Timestamp.now()
//       };
//       mockUserService.findByEmail.mockResolvedValueOnce(null);
//       mockUserService.createUser.mockResolvedValueOnce(newUser);

//       const response = await request(app).post('/users/').send({ email: 'new@example.com' });
//       expect(response.status).toBe(201);
//       expect(response.body).toHaveProperty('message', 'Usuario creado exitosamente');
//       expect(response.body).toHaveProperty('user');
//       expect(response.body.user).toHaveProperty('id', 'new-id');
//     });

//     it('POST /users/find-or-create debería devolver 400 cuando falta email', async () => {
//       const response = await request(app).post('/users/find-or-create').send({});
//       expect(response.status).toBe(400);
//       expect(response.body).toHaveProperty('message', 'El email es requerido');
//     });

//     it('POST /users/find-or-create debería devolver 200 y isNewUser=false cuando el usuario existe', async () => {
//       // Mock del servicio
//       const existingUser = {
//         id: 'existing-id',
//         email: 'existing@example.com',
//         createdAt: Timestamp.now()
//       };
//       mockUserService.findByEmail.mockResolvedValueOnce(existingUser);
//       mockUserService.findOrCreateUser.mockResolvedValueOnce(existingUser);

//       const response = await request(app).post('/users/find-or-create').send({ email: 'existing@example.com' });
//       expect(response.status).toBe(200);
//       expect(response.body).toHaveProperty('message', 'Usuario encontrado');
//       expect(response.body).toHaveProperty('user');
//       expect(response.body).toHaveProperty('isNewUser', false);
//     });

//     it('POST /users/find-or-create debería devolver 200 y isNewUser=true cuando se crea un nuevo usuario', async () => {
//       // Mock del servicio
//       const newUser = {
//         id: 'new-id',
//         email: 'new@example.com',
//         createdAt: Timestamp.now()
//       };
//       mockUserService.findByEmail.mockResolvedValueOnce(null);
//       mockUserService.findOrCreateUser.mockResolvedValueOnce(newUser);

//       const response = await request(app).post('/users/find-or-create').send({ email: 'new@example.com' });
//       expect(response.status).toBe(200);
//       expect(response.body).toHaveProperty('message', 'Usuario creado exitosamente');
//       expect(response.body).toHaveProperty('user');
//       expect(response.body).toHaveProperty('isNewUser', true);
//     });
//   });
// });