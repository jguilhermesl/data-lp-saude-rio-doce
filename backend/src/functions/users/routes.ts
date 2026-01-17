import { Router } from 'express';
import { createUser } from './create-user';

const routerUsers = Router();

// Apenas administradores podem criar usuários
routerUsers.post('/users', (req, res) => createUser(req, res));

export { routerUsers };
