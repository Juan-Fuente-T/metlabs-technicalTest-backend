// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { readDbFile, writeDbFile } from '../utils/dbUtils';
import { USERS_DB_PATH } from '../config/dbPaths';
import config from '../config/config';
import { OAuth2Client } from 'google-auth-library';

// Función para registrar un nuevo usuario
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Validar entrada (básico por ahora, se puede mejorar)
    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son requeridos.' });
      return;
    }
    // Aquí se podría añadir validaciones más robustas para el formato del email, longitud de contraseña, etc.
    
    // 1. Leer los usuarios existentes del archivo JSON
    const currentUsers = await readDbFile(USERS_DB_PATH) as User[];
    // 2. Verificar si el usuario ya existe
    const existingUser = currentUsers.find(user => user.email === email);
    if (existingUser) {
      res.status(409).json({ message: 'El email ya está registrado.' });
      return;
    }

    // 3. Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 4. Crear el nuevo usuario
    const newUser: User = {
      id: uuidv4(), // Usar UUID como ID mejorado
      email,
      passwordHash,
      walletAddress: undefined,
    };

    // 5. Guardar el usuario (en array en memoria por ahora) y reemplazarlo en el archivo JSON
    console.log('[DEBUG] 1  Contenido de currentUsers ANTES de escribir:', JSON.stringify(currentUsers, null, 2).substring(0, 300) + "..."); 
    currentUsers.push(newUser);
    console.log('[DEBUG] 2  Contenido de currentUsers ANTES de escribir:', JSON.stringify(currentUsers, null, 2).substring(0, 300) + "..."); 
    await writeDbFile(USERS_DB_PATH, currentUsers);

    // 6. Crear el JWT
    const payload = {
      userId: newUser.id,
      email: newUser.email,
    };

    const token = jwt.sign(
      payload,
      config.jwtSecret,
      { expiresIn: '1h' } 
    );
    // 7. Enviar respuesta (NO enviar NUNCA el passwordHash al cliente)
    // Se podría devolver solo un mensaje, o el usuario sin el hash
    const userResponse = { id: newUser.id, email: newUser.email };
    res.status(201).json({ message: 'Usuario registrado exitosamente', token, user: userResponse});
    // No hay 'return' aquí; la función termina después de enviar la respuesta.
    // TypeScript inferirá Promise<void> para esta ruta de ejecución exitosa.
  } catch (error) {
    // Si algo sale mal (ej. bcrypt falla), se pasa el error al manejador global
    next(error); // Esto también lleva a un tipo de retorno compatible (Promise<void>)
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son requeridos.' });
      return;
    }

    // 1. Leer los usuarios existentes del archivo JSON
    const currentUsers = await readDbFile(USERS_DB_PATH) as User[];

    // 2. Verificar si el usuario existe
    const user = currentUsers.find((user: User) => user.email === email);
    if (!user) {
      res.status(401).json({ message: 'Credenciales incorrectas.' });
      return;
    }

    // 2. Verificar la contraseña
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      res.status(401).json({ message: 'Credenciales incorrectas.' });
      return;
    }

    // 3. Si las credenciales son correctas, CREAR EL TOKEN JWT
    const payload = {
      userId: user.id,
      email: user.email,
      // Se puede añadir más info al payload, pero mejor ligero
    };

    const token = jwt.sign(
      payload,
      config.jwtSecret, 
      { expiresIn: '1h' } 
    );

    // 4. Enviar respuesta con el token con datos básicos del usuario
    const userResponse = { id: user.id, email: user.email, walletAddress: user.walletAddress };
    res.status(200).json({ 
      message: 'Inicio de sesión exitoso', 
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

export const loginOrRegisterWithGoogle = async (req: Request, res: Response, next: NextFunction) => {
  if (!config.googleClientId || config.googleClientId === "ID_NO_CONFIGURADO_REVISAR_ENV") {
    console.error('GOOGLE_CLIENT_ID no configurado en el backend para OAuth2Client.');
    // Devuelve un error o se maneja esta situación adecuadamente
    res.status(500).json({ message: 'Error de configuración del servidor para Google Login.' });
    return; 
  }
  
  const googleClient = new OAuth2Client(config.googleClientId)

  try {
    const { idToken } = req.body; // El frontend envía el idToken de Google

    if (!idToken) {
      res.status(400).json({ message: 'ID Token de Google no proporcionado.' });
      return;
    }
    if (!config.googleClientId) { // Verifica que el Client ID esté cargado en el backend
        console.error('GOOGLE_CLIENT_ID no configurado en el backend.');
        res.status(500).json({ message: 'Error de configuración del servidor para Google Login.' });
        return;
    }

    // Verifica el ID Token con Google
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: idToken,
        audience: config.googleClientId, // Especifica el Client ID como audiencia
      });
    } catch (verifyError) {
      console.error('Error verificando el ID token de Google:', verifyError);
      res.status(401).json({ message: 'Token de Google inválido o expirado.' });
      return; 
    }
    
    const googlePayload = ticket?.getPayload();

    if (!googlePayload || !googlePayload.sub || !googlePayload.email) {
      res.status(400).json({ message: 'No se pudo obtener la información del usuario desde el token de Google.' });
      return; 
    }

    const googleId = googlePayload.sub;
    const email = googlePayload.email;
    // const name = googlePayload.name; // Puede usarse para guardar el nombre
    // const picture = googlePayload.picture; // Y la imagen de perfil

    let currentUsers = await readDbFile(USERS_DB_PATH) as User[];
    let user = currentUsers.find(u => u.googleId === googleId); // Busca por googleId primero

    if (!user) { // Si no se encontró por googleId, busca por email
      user = currentUsers.find(u => u.email === email);
      if (user) {
        // Usuario encontrado por email, pero no tiene googleId (ej. se registró con email/pass)
        // Enlaza la cuenta añadiendo el googleId
        user.googleId = googleId;
        // Opcional: Actualizar otros datos si vienen de Google y son más recientes
      } else {
        // Usuario no encontrado ni por googleId ni por email: Crear nuevo usuario
        const newUser: User = {
          id: uuidv4(),
          email: email,
          // Para usuarios de Google, el passwordHash no es relevante para login con Google.
          // Podría ponerse un valor placeholder o dejarlo vacío si la BD lo permite,
          // o un hash de una contraseña aleatoria muy larga que nunca se usará.
          passwordHash: await bcrypt.hash(uuidv4() + Date.now(), 10), // Placeholder seguro
          googleId: googleId, // Guarda el ID de Google
          // name: name, // Si se quiere guardar el nombre
          // profilePictureUrl: picture, // Si se quiere guardar la imagen
          walletAddress: undefined, // O un valor inicial
        };
        currentUsers.push(newUser);
        user = newUser;
      }
      // Guardar cambios en users.json (si se actualizó un usuario existente o se creó uno nuevo)
      await writeDbFile(USERS_DB_PATH, currentUsers);
    }
    // Generar el PROPIO token JWT para la sesión de tu aplicación
    const appTokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const appToken = jwt.sign(
      appTokenPayload,
      config.jwtSecret,
      { expiresIn: '1h' }
    );

    //  Enviar respuesta con el token y datos básicos del usuario
    const userResponse = { id: user.id, email: user.email, walletAddress: user.walletAddress };
    res.status(200).json({
      message: 'Inicio de sesión con Google exitoso.',
      token: appToken,
      user: userResponse
    });

  } catch (error) {
    next(error);
  }
};

//Función para obtener todos los usuarios
//REVISAR
//TODO: Habría que comprobar que tiene permiso comparando los IDs
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUsers = await readDbFile(USERS_DB_PATH) as User[];
    const safeUsers = currentUsers.map((user: User) => {
      return {
        id: user.id,
        email: user.email,
        walletAddress: user.walletAddress
        // ¡IMPORTANTE! No incluir user.passwordHash
      };
    });
    res.status(200).json(safeUsers);
  } catch (error) {
    next(error);
  }
};


// Función para obtener un usuario por ID
// REVISAR
//TODO: Habria que comprobar que tiene permiso, comparando los IDs
export const getuserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUsers = await readDbFile(USERS_DB_PATH) as User[];
    const item = currentUsers.find((u: User) => u.id === req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    res.json(item);
  } catch (error) {
    next(error);
  }
};

// Función para actualizar un usuario
//REVISAR
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUsers = await readDbFile(USERS_DB_PATH) as User[];
    const itemIndex = currentUsers.findIndex((u: User) => u.id === req.params.id);
    if (itemIndex === -1) {
      res.status(404).json({ message: 'Item not found' });
      return;
    }
    const updatedItem = { ...currentUsers[itemIndex], ...req.body };
    currentUsers[itemIndex] = updatedItem;
    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
}
