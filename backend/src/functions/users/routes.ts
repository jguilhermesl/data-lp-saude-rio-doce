import { Router } from 'express';
import { authMiddleware } from '@/middlewares/auth-middleware';
import { createUser } from './create-user';
import { getAllUsers } from './get-all-users';
import { getUserById } from './get-user-by-id';
import { updateUser } from './update-user';
import { deleteUser } from './delete-user';

const routerUsers = Router();

// Buscar todos os usuários (requer autenticação)
routerUsers.get('/users', authMiddleware, (req, res) => getAllUsers(req, res));

// Buscar usuário por ID (requer autenticação)
routerUsers.get('/users/:id', authMiddleware, (req, res) => getUserById(req, res));

// Criar usuários (requer autenticação)
routerUsers.post('/users', authMiddleware, (req, res) => createUser(req, res));

// Atualizar usuários (requer autenticação)
routerUsers.put('/users/:id', authMiddleware, (req, res) => updateUser(req, res));

// Deletar usuários (requer autenticação)
routerUsers.delete('/users/:id', authMiddleware, (req, res) => deleteUser(req, res));

export { routerUsers };
