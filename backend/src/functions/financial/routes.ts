import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { getFinancialMetrics } from './get-financial-metrics';

const routerFinancial = Router();

// Buscar métricas financeiras (requer autenticação)
routerFinancial.get('/financial/metrics', authMiddleware, (req, res) => getFinancialMetrics(req, res));

export { routerFinancial };
