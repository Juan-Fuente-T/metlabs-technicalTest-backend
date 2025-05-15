import { Router, Request, Response, NextFunction } from 'express';
import {
    registerUser, 
    loginUser,
    getUsers,
    getuserById,
    updateUser
} from '../controllers/authController';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getuserById);
router.post('/register', registerUser); // Cambiado de '/' a '/register' para más claridad
router.post('/login', loginUser);
router.patch('/:id', updateUser);

export default router;