export interface Transaction {
    id: string;
    transactionHash: string;
    userAddress: string;
    createdAt?: Date;
  }
  
// Un array para almacenar las transacciones en memoria (luego será un archivo JSON)
// Temporalmente mientras no se use una base de datos
export let transactions: Transaction[] = [];