import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
}


const config: Config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'na_terraza_de_Metlabs_fai_aire', 
};

if (!config.jwtSecret || config.jwtSecret === 'na_terraza_de_Metlabs_fai_aire') {
  console.warn("ADVERTENCIA: JWT_SECRET no está configurado de forma segura en las variables de entorno. Usando valor por defecto.");
}

export default config;