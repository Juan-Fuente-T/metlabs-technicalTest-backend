# Metlabs - Prueba Técnica Backend

Este repositorio contiene el código del backend para la prueba técnica de Metlabs, desarrollado por Juan Fuente.

## Descripción

El backend es una API RESTful construida con Node.js, Express.js y TypeScript. Se encarga de gestionar la autenticación de usuarios (registro con email/contraseña y login con Google), el almacenamiento de perfiles de usuario básicos, y el registro de hashes de transacciones blockchain relacionadas con una aplicación Web3.

Para esta prueba, y según los requisitos, se utiliza un sistema de archivos JSON para simular una base de datos, facilitando la configuración y el desarrollo rápido.

## Funcionalidades Implementadas

* **Autenticación de Usuarios:**
    * Registro de nuevos usuarios (email y contraseña).
    * Inicio de sesión de usuarios existentes (email y contraseña) con devolución de token JWT.
    * Inicio de sesión / Registro a través de Google OAuth 2.0, con devolución de token JWT de la aplicación.
* **Gestión de Transacciones:**
    * Endpoint para guardar el hash de una transacción blockchain y la dirección del usuario asociada.
* **Perfiles de Usuario:**
    * Endpoint para obtener datos del perfil del usuario autenticado (cargados desde el backend).
* **Seguridad:**
    * Hashing de contraseñas con `bcryptjs`.
    * Autenticación basada en JSON Web Tokens (JWT) para rutas protegidas.
* **Manejo de Errores:**
    * Middleware global para un manejo de errores consistente.

## Tecnologías Utilizadas

* **Node.js:** Entorno de ejecución para JavaScript en el servidor.
* **Express.js:** Framework web para Node.js.
* **TypeScript:** Superset de JavaScript para tipado estático.
* **JSON Web Tokens (JWT):** Para la autenticación y sesiones.
* **bcryptjs:** Para el hasheo seguro de contraseñas.
* **google-auth-library:** Para la verificación de tokens de Google en el backend.
* **dotenv:** Para la gestión de variables de entorno.
* **ESLint:** Para el linting de código (configuración básica).
* **Simulación de Base de Datos:** Archivos JSON (`db/users.json`, `db/transactions.json`).

## Prerrequisitos

* Node.js (v18.x o v20.x recomendado)
* npm (viene con Node.js)

## Configuración y Puesta en Marcha

1.  **Clonar el Repositorio:**
    ```bash
    git clone https://github.com/Juan-Fuente-T/metlabs-technicalTest-backend.git
    cd backend
    ```

2.  **Instalar Dependencias:**
    ```bash
    npm install
    ```

3.  **Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto (`backend/.env`) basado en el siguiente ejemplo. **Es crucial configurar estas variables para el correcto funcionamiento de la autenticación y la aplicación.**

    ```env
    # .env.example - Copia esto a un archivo .env y rellena los valores

    # Puerto en el que correrá el servidor backend
    PORT=3000

    # Entorno de Node (development o production)
    NODE_ENV=development

    # Secreto para firmar los JSON Web Tokens (JWT)
    # Debe ser una cadena larga, compleja y aleatoria
    JWT_SECRET=TU_SECRETO_JWT_SUPER_SEGURO_AQUI

    # ID de Cliente de Google OAuth 2.0 (obtenido de Google Cloud Console)
    # Necesario para la verificación del token de Google en el backend
    GOOGLE_CLIENT_ID=TU_ID_DE_CLIENTE_DE_GOOGLE_AQUI
    ```

## Ejecutar la Aplicación

* **Modo Desarrollo (con `nodemon` para reinicios automáticos):**
    ```bash
    npm run dev
    ```
    El servidor normalmente se iniciará en `http://localhost:PUERTO` (el puerto especificado en tu `.env` o el fallback en `config.ts`).

* **Modo Producción (o para probar el build):**
    1.  Compilar TypeScript a JavaScript:
        ```bash
        npm run build
        ```
        Esto generará una carpeta `dist/` con los archivos JavaScript.
    2.  Iniciar el servidor desde los archivos compilados:
        ```bash
        npm start
        ```

## API Endpoints Principales

Las rutas base para la API son prefijadas (ej. `/api`).

* **Autenticación (ej. prefijo `/api/auth` o `/api/users` según tu `app.ts`):**
    * `POST /register`: Registro de nuevo usuario.
        * Body: `{ "email": "user@example.com", "password": "password123" }`
    * `POST /login`: Inicio de sesión.
        * Body: `{ "email": "user@example.com", "password": "password123" }`
        * Respuesta: Devuelve token JWT y datos del usuario.
    * `POST /google-login`: Inicio de sesión/registro con Google.
        * Body: `{ "idToken": "GOOGLE_ID_TOKEN_OBTENIDO_DEL_FRONTEND" }`
        * Respuesta: Devuelve token JWT de la aplicación y datos del usuario.

* **Usuarios (ej. prefijo `/api/users` o `/api/auth`):**
    * `GET /:id` : Obtiene el perfil del usuario autenticado. **(Ruta Protegida por JWT)**.

* **Transacciones (ej. prefijo `/api/transactions`):**
    * `POST /`: Guarda el hash de una transacción y la dirección del usuario. **(Ruta Protegida por JWT)**.
        * Body: `{ "transactionHash": "0x...", "userAddress": "0x...", "type": "deposit" | "withdraw" }`

## Consideraciones sobre la Base de Datos

Para los propósitos de esta prueba técnica y simplificar la configuración, se ha implementado un sistema de persistencia de datos basado en archivos JSON ubicados en la carpeta `db/`.

* `db/users.json`: Almacena la información de los usuarios.
* `db/transactions.json`: Almacena los hashes de las transacciones.

**Importante:** Esta aproximación es adecuada para un entorno de desarrollo o prueba. Para una aplicación en **producción**, se migraría esta lógica a un sistema de base de datos robusto y escalable como PostgreSQL, MongoDB, u otro similar, para garantizar la integridad, concurrencia y persistencia adecuada de los datos.

## Despliegue

Como el despliegue era opcional para esta prueba y para enfocar el esfuerzo en las funcionalidades principales dentro del tiempo estimado, este backend está configurado para ejecución local.

Para un despliegue en producción, se considerarían plataformas como Render, Fly.io, o Railway.app, junto con la necesaria transición de la persistencia de datos basada en archivos JSON a una solución de base de datos gestionada.

## Autor

Juan Fuente