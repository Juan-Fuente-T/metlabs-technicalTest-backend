import dotenv from 'dotenv';
dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  googleClientId: string;
}
const googleClientIdFromEnv = process.env.GOOGLE_CLIENT_ID;

if (!googleClientIdFromEnv) {
  console.error("ERROR FATAL: La variable de entorno GOOGLE_CLIENT_ID no está definida.");
  // En un caso real, podría desearse que la aplicación no inicie:
  // process.exit(1); 
  // Ahora basta un placeholder y advertir fuertemente,
  // o simplemente dejar que falle si la lógica de googleClient lo requiere sí o sí.
  // Por ahora, para que TypeScript no falle, se le da un string (aunque sea uno que cause error en Google si no está el .env):
  // throw new Error("GOOGLE_CLIENT_ID es requerida y no está definida en .env"); // Esto pararía la app
}

const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'na_terraza_de_Metlabs_fai_aire', 
  googleClientId: process.env.GOOGLE_CLIENT_ID || "ID_NO_CONFIGURADO_REVISAR_ENV"
};

if (!config.jwtSecret || config.jwtSecret === 'na_terraza_de_Metlabs_fai_aire') {
  console.warn("ADVERTENCIA: JWT_SECRET no está configurado de forma segura en las variables de entorno. Usando valor por defecto.");
}
if (!config.googleClientId || config.googleClientId === "ID_NO_CONFIGURADO_REVISAR_ENV") { 
  console.warn("ADVERTENCIA: GOOGLE_CLIENT_ID no está configurado en el backend. El login con Google fallará.");
}

export default config;