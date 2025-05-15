// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { readDbFile, writeDbFile } from '../utils/dbUtils';
import { USERS_DB_PATH } from '../config/dbPaths';




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

    // 6. Enviar respuesta (NO enviar NUNCA el passwordHash al cliente)
    // Se podría devolver solo un mensaje, o el usuario sin el hash
    const userResponse = { id: newUser.id, email: newUser.email };
    res.status(201).json({ message: 'Usuario registrado exitosamente', user: userResponse });
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

    // 3. Enviar respuesta
    const userResponse = { id: user.id, email: user.email };
    res.status(200).json({ message: 'Inicio de sesión exitoso', user: userResponse });
  } catch (error) {
    next(error);
  }
};

//Función para obtener todos los usuarios
//REVISAR
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
