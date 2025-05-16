// src/api/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';

// Podrías extenderse la interfaz Request de Express para añadir la propiedad 'user'
// para pasar la info del payload del token a los siguientes manejadores.
export interface RequestWithUser extends Request {
  user?: { userId: string; email: string; /* otros campos del payload */ };
}

export const protect = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // Obtiene el token después de "Bearer "

    try {
      // Verifica el token
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string; iat: number; exp: number };

      // Opcional: Se podría adjuntar la info del usuario decodificada al objeto req
      // para que los siguientes manejadores de ruta puedan usarla.
      // Por ejemplo, buscar el usuario guardado en "DB" aquí si fuese necesario
      req.user = { userId: decoded.userId, email: decoded.email }; 

      next(); // El token es válido, continúa a la siguiente función/manejador de ruta
    } catch (error) {
      console.error('Error de verificación de token:', error);
      res.status(401).json({ message: 'Token no válido o expirado.' });
    }
  } else {
    res.status(401).json({ message: 'No autorizado, no se proporcionó token o formato incorrecto.' });
  }
};