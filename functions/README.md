# API de Gestión de Tareas - Backend

## Descripción del Proyecto

Este proyecto implementa una API RESTful para gestionar tareas de usuarios, desarrollada con TypeScript, Express y Firebase Cloud Functions. La API permite la creación, lectura, actualización y eliminación de tareas (CRUD), así como la gestión de usuarios y autenticación mediante JWT.

## Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución para JavaScript del lado del servidor
- **TypeScript**: Superset de JavaScript que añade tipado estático
- **Express**: Framework web para Node.js
- **Firebase Cloud Functions**: Servicio serverless para alojar la API
- **Firestore**: Base de datos NoSQL para almacenar los datos
- **JWT (JSON Web Tokens)**: Para la autenticación de usuarios
- **Swagger**: Documentación interactiva de la API

## Arquitectura

El proyecto sigue los principios de arquitectura limpia (Clean Architecture) y Domain-Driven Design (DDD), con una clara separación de responsabilidades:

### Estructura de Carpetas

```
functions/src/
├── common/                  # Elementos comunes y transversales
│   └── exceptions/          # Excepciones personalizadas
├── controllers/             # Controladores de la API
├── dtos/                    # Objetos de transferencia de datos
├── middlewares/             # Middlewares de Express
├── models/                  # Modelos de dominio
├── repositories/            # Acceso a datos (Firestore)
├── routes/                  # Definición de rutas de la API
├── services/                # Lógica de negocio
└── utils/                   # Utilidades

```

## Patrones y Principios de Diseño

### Principios SOLID

- **S (Responsabilidad Única)**: Cada clase tiene una única responsabilidad
- **O (Abierto/Cerrado)**: Entidades extensibles sin modificar el código existente
- **L (Sustitución de Liskov)**: Las clases derivadas pueden sustituir a sus clases base
- **I (Segregación de Interfaces)**: Interfaces específicas para clientes específicos
- **D (Inversión de Dependencias)**: Dependencias de abstracciones, no de implementaciones

### Patrones Implementados

- **Repository Pattern**: Encapsulamiento de la lógica de acceso a datos
- **Service Layer**: Lógica de negocio separada de los controladores
- **DTO Pattern**: Transferencia de datos entre capas sin exponer la estructura interna
- **Dependency Injection**: Inyección de dependencias para facilitar pruebas y desacoplamiento
- **Exception Handling**: Manejo centralizado de excepciones a través de clases personalizadas

## Seguridad

- **JWT**: Implementación de tokens para autenticación
- **Middleware de Autenticación**: Protección de rutas sensibles
- **CORS**: Configuración para permitir acceso desde el frontend
- **Validación de Datos**: Control de entradas para prevenir inyecciones

## Endpoints de la API

### Usuarios

- `GET /users/find`: Busca un usuario por su email
- `POST /users`: Crea un nuevo usuario y devuelve un token JWT
- `POST /users/find-or-create`: Busca un usuario o lo crea si no existe
- `POST /users/authenticate`: Autentica a un usuario existente y devuelve un token JWT

### Tareas

- `GET /tasks/user`: Obtiene todas las tareas del usuario autenticado
- `GET /tasks/:id`: Obtiene una tarea específica por su ID
- `POST /tasks`: Crea una nueva tarea
- `PUT /tasks/:id`: Actualiza una tarea existente
- `DELETE /tasks/:id`: Elimina una tarea
- `PATCH /tasks/:id/toggle-completion`: Cambia el estado de completado de una tarea

## Decisiones Técnicas

### ¿Por qué Express 5?

Se utilizó Express 5 en su versión beta por sus mejoras en el manejo de promesas, mejor gestión de errores y compatibilidad mejorada con ECMAScript moderno.

### ¿Por qué Firebase Cloud Functions?

- **Escalabilidad**: Escala automáticamente según la demanda
- **Sin servidor**: No hay necesidad de gestionar infraestructura
- **Integración**: Funciona perfectamente con otros servicios de Firebase
- **Costos**: Modelo de pago por uso, ideal para aplicaciones pequeñas y medianas

### ¿Por qué Firestore?

- **Base de datos NoSQL**: Flexibilidad en el esquema
- **Tiempo real**: Posibilidad de actualizaciones en tiempo real
- **Escalabilidad**: Diseñada para escalar automáticamente
- **Integración con Firebase**: Perfecta integración con Cloud Functions

### ¿Por qué JWT?

- **Stateless**: No requiere almacenar estado de sesión en el servidor
- **Escalabilidad**: Funciona bien en entornos distribuidos
- **Simplicidad**: Fácil de implementar y usar
- **Seguridad**: Proporciona mecanismos para verificar la integridad de los tokens

## Mejoras Futuras

- **Testing**: Implementar pruebas unitarias y de integración
- **Validación**: Mejorar la validación de datos usando bibliotecas como zod o joi
- **Logging**: Sistema de registro más robusto
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Refresh Tokens**: Implementar refresh tokens para mejorar la experiencia de usuario
- **Caché**: Añadir caché para operaciones frecuentes

## Cómo ejecutar el proyecto localmente

1. Clona el repositorio
2. Navega a la carpeta `functions`
3. Instala las dependencias con `npm install` o `pnpm install`
4. Configura tus credenciales de Firebase en `.runtimeconfig.json`
5. Ejecuta `npm run serve` para iniciar el servidor de desarrollo

## Cómo desplegar el proyecto

1. Instala Firebase CLI: `npm install -g firebase-tools`
2. Inicia sesión en Firebase: `firebase login`
3. Selecciona el proyecto: `firebase use <project-id>`
4. Despliega las funciones: `firebase deploy --only functions`

## Endpoints de documentación

- **API Docs**: [https://us-central1-atom-challenge-2025.cloudfunctions.net/apiV1/api-docs/swagger.json](https://us-central1-atom-challenge-2025.cloudfunctions.net/apiV1/api-docs/swagger.json)
- **Health Check**: [https://us-central1-atom-challenge-2025.cloudfunctions.net/apiV1/health](https://us-central1-atom-challenge-2025.cloudfunctions.net/apiV1/health)