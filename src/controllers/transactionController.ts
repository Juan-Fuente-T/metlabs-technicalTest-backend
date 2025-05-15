// src/controllers/transactionController.ts
import { Request, Response, NextFunction } from 'express';
import { Transaction, transactions } from '../models/transaction';
import { v4 as uuidv4 } from 'uuid'; // Para generar IDs únicos mejorados

// Función para añadir una nueva transacción
export const addTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { transactionHash, userAddress } = req.body;

        // 1. Validar entrada (básico por ahora)
        if (!transactionHash || !userAddress) {
            res.status(400).json({ message: 'transactionHash y userAddress son requeridos.' });
            return;
        }
        // Aquí se podrían añadir validaciones más robustas (ej. formato del hash, formato de la dirección)

        // 2. Crear la nueva transacción
        const newTransaction: Transaction = {
            id: uuidv4(), // Usar UUID como ID mejorado
            transactionHash,
            userAddress,
            createdAt: new Date()
        };

        // 3. Guardar la transacción (en el array en memoria por ahora)
        transactions.push(newTransaction);
        // MÁS ADELANTE: Aquí irá la lógica para guardar en el archivo transactions.json

        // 4. Enviar respuesta
        res.status(201).json({ message: 'Transacción añadida exitosamente', transaction: newTransaction });

    } catch (error) {
        // Si algo sale mal, pasamos el error al manejador global
        next(error);
    }
};

//Función para obtener todas las transacciones de un usuario
export const getTransactionsByUser = (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userAddress } = req.params; // o req.query, dependiendo de cómo lo definas en la ruta
        if (!userAddress) {
            res.status(400).json({ message: 'userAddress es requerido.' });
            return;
        }
        const userTransactions = transactions.filter(tx => tx.userAddress === userAddress);
        res.status(200).json(userTransactions);
    } catch (error) {
        next(error);
    }
};
