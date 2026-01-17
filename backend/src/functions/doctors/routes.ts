import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { getDoctorById } from './get-doctor-by-id';
import { getDoctorsMetrics } from './get-doctors-metrics';

const routerDoctors = Router();

// Todas as rotas de médicos requerem autenticação
// routerDoctors.use(authMiddleware);

// Rotas de listagem e detalhes
routerDoctors.get('/doctors/metrics/summary', (req, res) => getDoctorsMetrics(req, res));
routerDoctors.get('/doctors/:id', (req, res) => getDoctorById(req, res));

export { routerDoctors };
