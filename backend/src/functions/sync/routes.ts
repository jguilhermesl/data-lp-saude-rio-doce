import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { onlyAdminMiddleware } from '@/middlewares/only-admin-middleware';
import { executeSync } from './execute-sync';

const routerSync = Router();

// Todas as rotas de sync requerem autenticação e permissão de admin
routerSync.use(authMiddleware);
routerSync.use(onlyAdminMiddleware);

// Rota para executar sincronização completa
routerSync.post('/sync/all', (req, res) => executeSync(req, res));

export { routerSync };
