import express, {Express} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.config';
import usersRouter  from './routes/users.route';
import tasksRouter  from './routes/tasks.route';

// Inicializar Express
const app:Express = express();

// Middlewares
app.use(helmet({contentSecurityPolicy: false})); // Seguridad
app.use(cors({origin:"https://merry-cocada-8d6255.netlify.app"})); // Permitir CORS
app.use(express.json()); // Parsear JSON

// Rutas API - IMPORTANTE: No usar prefijo "/api/" aquí para los tests
app.use('/users', usersRouter);
app.use('/tasks', tasksRouter);

// Documentación Swagger - Ruta principal para acceder a la documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true 
    }
  }));

// Ruta para obtener el archivo de especificación swagger.json
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Ruta de estado de salud
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Bienvenido a la API de Tareas',
    documentation: '/api-docs'
  });
});

// Puerto
const PORT = process.env.PORT || 5000;

// Función para iniciar el servidor (usado por index.ts y para pruebas)
export function startServer() {
  return app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`📚 Documentación disponible en http://localhost:${PORT}/api-docs`);
  });
}

// Si este archivo se ejecuta directamente
if (require.main === module) {
  startServer();
}

export default app;