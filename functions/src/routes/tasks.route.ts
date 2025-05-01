import { Router } from 'express';
import { TasksController } from '../controllers/tasks.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const tasksRouter:Router = Router();
const tasksController = new TasksController();

// Aplicar middleware de autenticación a todas las rutas de tareas
tasksRouter.use(authMiddleware);

/**
 * @swagger
 * /api/tasks/user:
 *   get:
 *     summary: Obtiene todas las tareas de un usuario
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tareas del usuario
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *       400:
 *         description: ID del usuario inválido
 *       500:
 *         description: Error del servidor
 */
tasksRouter.get('/user', tasksController.getAllTasksByUserId);

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtiene una tarea por su ID
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea
 *     responses:
 *       200:
 *         description: Tarea encontrada
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *       404:
 *         description: Tarea no encontrada
 *       400:
 *         description: ID de tarea inválido
 *       500:
 *         description: Error del servidor
 */
tasksRouter.get('/:id', tasksController.getTaskById);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Crea una nueva tarea
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               userId:
 *                 type: string
 *             required:
 *               - title
 *               - userId
 *     responses:
 *       201:
 *         description: Tarea creada exitosamente
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
tasksRouter.post('/', tasksController.createTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Actualiza una tarea existente
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *               userId:
 *                 type: string
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Tarea actualizada exitosamente
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *       404:
 *         description: Tarea no encontrada o sin permisos
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
tasksRouter.put('/:id', tasksController.updateTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Elimina una tarea
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *             required:
 *               - userId
 *     responses:
 *       200:
 *         description: Tarea eliminada exitosamente
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *       404:
 *         description: Tarea no encontrada o sin permisos
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
tasksRouter.delete('/:id', tasksController.deleteTask);

/**
 * @swagger
 * /api/tasks/{id}/toggle-completion:
 *   patch:
 *     summary: Marca una tarea como completada o pendiente
 *     tags: [Tasks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la tarea
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               completed:
 *                 type: boolean
 *             required:
 *               - userId
 *               - completed
 *     responses:
 *       200:
 *         description: Estado de tarea actualizado exitosamente
 *       401:
 *         description: No autorizado - Token inválido o expirado
 *       404:
 *         description: Tarea no encontrada o sin permisos
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error del servidor
 */
tasksRouter.patch('/:id/toggle-completion', tasksController.toggleTaskCompletion);

export default tasksRouter;