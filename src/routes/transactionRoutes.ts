import { Router } from 'express';
import {
    addTransaction,
    getTransactionsByUser
} from '../controllers/transactionController';

const router = Router();

router.get('/', getTransactionsByUser);
router.post('/', addTransaction);

export default router;