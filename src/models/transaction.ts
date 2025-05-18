import { TransactionTypeValue } from "../utils/constants";

export interface Transaction {
    id: string;
    transactionHash: string;
    userAddress: string;
    type: TransactionTypeValue; // 'deposit' o 'withdraw'
    createdAt?: Date;
  }
  
