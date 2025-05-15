// src/config/dbPaths.ts
import path from 'path';

// process.cwd() devuelve el directorio de trabajo actual (la raíz del proyecto cuando se ejecuta el servidor)
export const USERS_DB_PATH = path.join(process.cwd(), 'db', 'users.json');
export const TRANSACTIONS_DB_PATH = path.join(process.cwd(), 'db', 'transactions.json');