import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { getAllSpecialties } from './get-all-specialties';
import { getSpecialtyById } from './get-specialty-by-id';

const routerSpecialties = Router();

// Todas as rotas de especialidades requerem autenticação
routerSpecialties.use(authMiddleware);

// Rotas de listagem e detalhes
routerSpecialties.get('/specialties', (req, res) => getAllSpecialties(req, res));
routerSpecialties.get('/specialties/:id', (req, res) => getSpecialtyById(req, res));

export { routerSpecialties };
