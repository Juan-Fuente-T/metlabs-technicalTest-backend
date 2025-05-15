// src/index.ts
import express from 'express';
const app = express();
const port = Number(process.env.PORT) || 3000;

console.log("¡Hola desde src/index.ts!");
app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
    res.send('¡Mi servidor Express funciona!');
  });
  
  app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
  });