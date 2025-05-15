import express from 'express';
import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import { errorHandler } from './middlewares/errorHandler';
import cors from 'cors';

const app = express();

// Permite todas las peticiones (para desarrollo solo)
app.use(cors()); 
// app.use(cors({ origin: 'https://tu-dominio-frontend.com' }));

app.use(express.json());

console.log("¡Hola desde src/index.ts!");

//Ruta de prueba
app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
    res.send('¡Mi servidor Express funciona!');
});

// Routes
app.use('/api/users', authRoutes);
app.use('/api/transactions', transactionRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;


