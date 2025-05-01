import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Tareas',
      version: '1.0.0',
      description: 'API para gestionar tareas de usuarios con autenticación JWT',
      contact: {
        name: 'Desarrollador',
        url: 'https://github.com/KBRR11/api-task-challenge',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001/atom-challenge-2025/us-central1/api',
        description: 'Servidor de desarrollo',
      },
      {
        url: 'https://us-central1-atom-challenge-2025.cloudfunctions.net/apiV1',
        description: 'Servidor de producción',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa tu token JWT con el formato: Bearer {token}'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único del usuario',
            },
            email: {
              type: 'string',
              description: 'Correo electrónico del usuario',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación del usuario',
            },
          },
        },
        Task: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'ID único de la tarea',
            },
            title: {
              type: 'string',
              description: 'Título de la tarea',
            },
            description: {
              type: 'string',
              description: 'Descripción detallada de la tarea',
            },
            completed: {
              type: 'boolean',
              description: 'Estado de completado de la tarea',
            },
            userId: {
              type: 'string',
              description: 'ID del usuario propietario de la tarea',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación de la tarea',
            },
          },
        },
        CreateUserDto: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              description: 'Correo electrónico del usuario',
            },
          },
        },
        CreateTaskDto: {
          type: 'object',
          required: ['title', 'userId'],
          properties: {
            title: {
              type: 'string',
              description: 'Título de la tarea',
            },
            description: {
              type: 'string',
              description: 'Descripción detallada de la tarea',
            },
            userId: {
              type: 'string',
              description: 'ID del usuario propietario de la tarea',
            },
          },
        },
        UpdateTaskDto: {
          type: 'object',
          required: ['userId'],
          properties: {
            title: {
              type: 'string',
              description: 'Título actualizado de la tarea',
            },
            description: {
              type: 'string',
              description: 'Descripción actualizada de la tarea',
            },
            completed: {
              type: 'boolean',
              description: 'Estado actualizado de completado',
            },
            userId: {
              type: 'string',
              description: 'ID del usuario propietario (para verificación)',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Mensaje de respuesta',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              description: 'Token JWT para autenticación',
            }
          }
        }
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Paths to files containing OpenAPI definitions
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;