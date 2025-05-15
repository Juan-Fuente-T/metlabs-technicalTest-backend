// src/controllers/transactionController.ts
import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/transaction';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos mejorados
import { readDbFile, writeDbFile } from '../utils/dbUtils';
import { TRANSACTIONS_DB_PATH } from '../config/dbPaths';

// Función para añadir una nueva transacción
export const addTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { transactionHash, userAddress, type } = req.body;

        // 1. Validar entradas (básico por ahora)
        if (!transactionHash || !userAddress) {
            res.status(400).json({ message: 'transactionHash y userAddress son requeridos.' });
            return;
        }
        // Validar que 'type' sea uno de los valores esperados
        if (type !== 'deposit' && type !== 'withdraw') {
            res.status(400).json({ message: 'El campo "type" debe ser "deposit" o "withdraw".' });
            return;
        }
        // Aquí se podrían añadir validaciones más robustas (ej. formato del hash, formato de la dirección)
        
        console.log('[DEBUG] transactionHash:', transactionHash);
        console.log('[DEBUG] userAddress:', userAddress);
        console.log('[DEBUG] type:', type);
        const currentTransactions = await readDbFile(TRANSACTIONS_DB_PATH) as Transaction[];
        console.log('[DEBUG] currentTransactions:', currentTransactions);

        // 2. Crear la nueva transacción
        const newTransaction: Transaction = {
            id: uuidv4(), // Usar UUID como ID mejorado
            transactionHash,
            userAddress,
            type,
            createdAt: new Date()
        };
        // 3. Guardar la transacción (en array en memoria por ahora) y reemplazarlo en el archivo JSON
        console.log('[DEBUG] 1  Contenido de currentTransactions ANTES de escribir:', JSON.stringify(currentTransactions, null, 2).substring(0, 300) + "...");
        currentTransactions.push(newTransaction);
        console.log('[DEBUG] 2  Contenido de currentUsers ANTES de escribir:', JSON.stringify(currentTransactions, null, 2).substring(0, 300) + "...");
        await writeDbFile(TRANSACTIONS_DB_PATH, currentTransactions);
        
        // 4. Enviar respuesta
        res.status(201).json({ message: 'Transacción añadida exitosamente', transaction: newTransaction });

    } catch (error) {
        // Si algo sale mal, pasamos el error al manejador global
        next(error);
    }
};

//Función para obtener todas las transacciones de un usuario
export const getTransactionsByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userAddress } = req.params; // o req.query, dependiendo de cómo lo definas en la ruta
        if (!userAddress) {
            res.status(400).json({ message: 'userAddress es requerido.' });
            return;
        }

        const currentTransactions = await readDbFile(TRANSACTIONS_DB_PATH) as Transaction[];

        const userTransactions = currentTransactions .filter(tx => tx.userAddress === userAddress);
        res.status(200).json(userTransactions);
    } catch (error) {
        next(error);
    }
};
