import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { getAllProcedures } from './get-all-procedures';
import { getProcedureById } from './get-procedure-by-id';
import { getProceduresMetrics } from './get-procedures-metrics';

const routerProcedures = Router();

// Todas as rotas de procedimentos requerem autenticação
routerProcedures.use(authMiddleware);

// Rotas de listagem e detalhes
routerProcedures.get('/procedures', (req, res) => getAllProcedures(req, res));
routerProcedures.get('/procedures/metrics/summary', (req, res) =>
  getProceduresMetrics(req, res)
);
routerProcedures.get('/procedures/:id', (req, res) => getProcedureById(req, res));

export { routerProcedures };
