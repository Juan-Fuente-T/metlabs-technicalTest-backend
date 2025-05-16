
    export interface User {
        id: string;
        email: string;
        passwordHash: string;  //Solo para login email/pass
        googleId?: string;
        name?: string;         // Nombre y foto del usuario (pueden venir de Google)
        profilePictureUrl?: string;
        walletAddress?: string;

      }
    // Un array para almacenar los usuarios en memoria (luego será un archivo JSON)
    // Temporalmente mientras no se use una base de datos
    // export let users: User[] = [];