import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { dispatch30Days } from './dispatch-30-days';
import { dispatch60Days } from './dispatch-60-days';
import { dispatch90Days } from './dispatch-90-days';
import { getDispatchReports } from './get-dispatch-reports';
import { getDispatchById } from './get-dispatch-by-id';
import { updateItemSatisfaction } from './update-item-satisfaction';

const routerDispatches = Router();

// Todas as rotas de dispatches requerem autenticação

// Rotas de disparo (POST)
routerDispatches.post('/dispatches/30-days', (req, res) => dispatch30Days(req, res));
routerDispatches.post('/dispatches/60-days', (req, res) => dispatch60Days(req, res));
routerDispatches.post('/dispatches/90-days', (req, res) => dispatch90Days(req, res));

// Rotas de relatórios (GET)
routerDispatches.get('/dispatches/reports', (req, res) => getDispatchReports(req, res));
routerDispatches.get('/dispatches/:id', (req, res) => getDispatchById(req, res));

// Rotas de atualização (PATCH)
routerDispatches.patch('/dispatches/items/:itemId/satisfaction', (req, res) => updateItemSatisfaction(req, res));

export { routerDispatches };
