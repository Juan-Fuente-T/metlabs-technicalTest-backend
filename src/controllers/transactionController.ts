// src/controllers/transactionController.ts
import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/transaction';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos mejorados
import { readDbFile, writeDbFile } from '../utils/dbUtils';
import { TRANSACTION_TYPES, TransactionTypeValue } from '../utils/constants';
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
        if (type !== TRANSACTION_TYPES.DEPOSIT && type !== TRANSACTION_TYPES.WITHDRAW) {
            res.status(400).json({ message: 'El campo "type" debe ser "deposit" o "withdraw".' });
            return;
        }
        // Aquí se podrían añadir validaciones más robustas (ej. formato del hash, formato de la dirección)
        
        // Lee las transacciones existentes del archivo JSON
        const currentTransactions = await readDbFile(TRANSACTIONS_DB_PATH) as Transaction[];

        // 2. Crear la nueva transacción
        const newTransaction: Transaction = {
            id: uuidv4(), // Usar UUID como ID mejorado
            transactionHash,
            userAddress,
            type: type as TransactionTypeValue, // Asegurarse de que el tipo es correcto
            createdAt: new Date()
        };
        // 3. Guardar la transacción (en array en memoria por ahora) y reemplazarlo en el archivo JSON
        currentTransactions.push(newTransaction);
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
