import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { getProcedureById } from './get-procedure-by-id';
import { getProceduresMetrics } from './get-procedures-metrics';

const routerProcedures = Router();

// Todas as rotas de procedimentos requerem autenticação
// routerProcedures.use(authMiddleware);

// Rotas de listagem e detalhes
// IMPORTANTE: Rotas específicas devem vir ANTES de rotas com parâmetros dinâmicos
routerProcedures.get('/procedures/:id', (req, res) => getProcedureById(req, res));
routerProcedures.get('/procedures/metrics/summary', (req, res) => getProceduresMetrics(req, res));

export { routerProcedures };
