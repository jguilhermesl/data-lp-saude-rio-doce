import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { getPatientById } from './get-patient-by-id';
import { getPatientsMetrics } from './get-patients-metrics';
import { getInactivePatients } from './get-inactive-patients';

const routerPatients = Router();

// Todas as rotas de pacientes requerem autenticação
routerPatients.use(authMiddleware);

// Rotas de listagem e detalhes
routerPatients.get('/patients/metrics/summary', (req, res) => getPatientsMetrics(req, res));
routerPatients.get('/patients/inactive', (req, res) => getInactivePatients(req, res));
routerPatients.get('/patients/:id', (req, res) => getPatientById(req, res));

export { routerPatients };
