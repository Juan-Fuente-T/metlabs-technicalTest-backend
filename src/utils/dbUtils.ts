// src/utils/dbUtils.ts
import fs from 'fs/promises'; // Versión de promesas de fs
import { User } from '../models/user'; 
import { Transaction } from '../models/transaction'; 

// Tipo genérico para los datos que espera leer (un array de User o Transaction)
type DbData = User[] | Transaction[];

// Función para leer un archivo JSON de la "base de datos"
export const readDbFile = async (filePath: string): Promise<DbData> => {
  try {
    // Intenta leer el archivo
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as DbData; // Parsea el JSON a un array del tipo esperado
  } catch (error: any) {
    // Si el archivo no existe (ENOENT) o está vacío/malformado,
    // lo trata como una "base de datos" vacía.
    if (error.code === 'ENOENT') {
      console.warn(`Archivo no encontrado en ${filePath}, se devolverá un array vacío.`);
      return []; // Devuelve un array vacío si el archivo no existe
    }
    // Si es otro tipo de error (ej. JSON malformado pero el archivo existe), relanza.
    console.error(`Error leyendo el archivo ${filePath}:`, error);
    throw new Error(`No se pudo leer el archivo de datos: ${filePath}`);
  }
};

// Función para escribir datos en un archivo JSON de la "base de datos"
export const writeDbFile = async (filePath: string, data: DbData): Promise<void> => {
  try {
    console.log(`[DEBUG] Intentando escribir en archivo: ${filePath}`); 
    const jsonData = JSON.stringify(data, null, 2); // Convertir el array a string JSON formateado
    await fs.writeFile(filePath, jsonData, 'utf-8');
    console.log(`[DEBUG] Archivo ${filePath} escrito exitosamente.`); 
  } catch (error) {
    console.error(`Error escribiendo en el archivo ${filePath}:`, error);
    throw new Error(`No se pudo escribir en el archivo de datos: ${filePath}`);
  }
};