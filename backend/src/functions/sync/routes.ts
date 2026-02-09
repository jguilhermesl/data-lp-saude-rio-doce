import { Router } from 'express';
import { executeSync } from './execute-sync';

const routerSync = Router();

// Todas as rotas de sync requerem autenticação e permissão de admin

// Rota para executar sincronização completa
routerSync.post('/sync/all', (req, res) => executeSync(req, res));

export { routerSync };
