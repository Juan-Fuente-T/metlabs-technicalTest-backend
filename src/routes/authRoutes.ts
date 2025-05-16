import { Router, Request, Response, NextFunction } from 'express';
import {
    registerUser, 
    loginUser,
    getUsers,
    getuserById,
    updateUser
} from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', protect,getUsers);
router.get('/:id', protect, getuserById);
router.post('/register', registerUser); // Cambiado de '/' a '/register' para más claridad
router.post('/login', loginUser);
router.patch('/:id', protect, updateUser);

export default router;