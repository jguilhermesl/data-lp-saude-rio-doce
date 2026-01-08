import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { getDashboardMetrics } from './get-dashboard-metrics';

const routerDashboard = Router();

// Todas as rotas do dashboard requerem autenticação
routerDashboard.use(authMiddleware);

// Rota de métricas do dashboard
routerDashboard.get('/dashboard/metrics', (req, res) => getDashboardMetrics(req, res));

export { routerDashboard };
