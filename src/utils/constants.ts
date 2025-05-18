// metlabs-backend/src/utils/constants.ts

export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
} as const;

// Este tipo es para usarlo en tus interfaces/modelos del backend
export type TransactionTypeValue = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
