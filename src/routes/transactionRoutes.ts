import { Router } from 'express';
import {
    addTransaction,
    getTransactionsByUser
} from '../controllers/transactionController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', getTransactionsByUser);
// Esta ruta está protegida: solo usuarios con un token válido podrán añadir transacciones.
router.post('/', protect, addTransaction); 

export default router;