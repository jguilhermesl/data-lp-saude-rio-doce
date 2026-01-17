import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { getAppointmentById } from './get-appointment-by-id';
import { getAppointmentsMetrics } from './get-appointments-metrics';

const routerAppointments = Router();

// Todas as rotas de atendimentos requerem autenticação
// routerAppointments.use(authMiddleware);

// Rotas de listagem e detalhes
routerAppointments.get('/appointments/metrics/summary', (req, res) =>
  getAppointmentsMetrics(req, res)
);
routerAppointments.get('/appointments/:id', (req, res) => getAppointmentById(req, res));

export { routerAppointments };
