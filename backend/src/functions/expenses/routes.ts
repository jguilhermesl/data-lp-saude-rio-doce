import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { createExpense } from './create-expense';
import { getAllExpenses } from './get-all-expenses';
import { updateExpense } from './update-expense';
import { deleteExpense } from './delete-expense';

const routerExpenses = Router();

// Buscar todas as despesas (requer autenticação)
routerExpenses.get('/expenses', authMiddleware, (req, res) => getAllExpenses(req, res));

// Criar despesa (requer autenticação)
routerExpenses.post('/expenses', authMiddleware, (req, res) => createExpense(req, res));

// Atualizar despesa (requer autenticação)
routerExpenses.put('/expenses/:id', authMiddleware, (req, res) => updateExpense(req, res));

// Deletar despesa (requer autenticação)
routerExpenses.delete('/expenses/:id', authMiddleware, (req, res) => deleteExpense(req, res));

export { routerExpenses };
