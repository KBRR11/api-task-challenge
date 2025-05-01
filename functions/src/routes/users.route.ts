import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';

const usersRouter:Router = Router();
const usersController = new UsersController();

/**
 * @swagger
 * /api/users/find:
 *   get:
 *     summary: Busca un usuario por su email
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 exists:
 *                   type: boolean
 *       404:
 *         description: Usuario no encontrado
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
usersRouter.get('/find', usersController.findByEmail);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       409:
 *         description: Ya existe un usuario con este email
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
usersRouter.post('/', usersController.createUser);

/**
 * @swagger
 * /api/users/find-or-create:
 *   post:
 *     summary: Busca un usuario por su email o lo crea si no existe
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: Usuario encontrado o creado
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
usersRouter.post('/find-or-create', usersController.findOrCreateUser);

export default usersRouter;