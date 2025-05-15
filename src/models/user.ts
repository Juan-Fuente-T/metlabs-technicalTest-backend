
    export interface User {
        id: string;
        email: string;
        passwordHash: string;
        walletAddress?: string;
      }
    // Un array para almacenar los usuarios en memoria (luego será un archivo JSON)
    // Temporalmente mientras no se use una base de datos
    export let users: User[] = [];