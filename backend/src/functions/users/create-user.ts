import { handleErrors } from "@/utils/handle-errors";
import { z } from "zod";
import { hash } from "bcrypt";
import { UserDAO } from "@/DAO/user";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'MANAGER', 'VIEWER']).default('VIEWER')
});

export const createUser = async (req: any, res: any) => {
  try {
    const { email, name, password, role } = createUserSchema.parse(req.body);

    const dao = new UserDAO();
    
    // Verifica se já existe um usuário com este email
    const existingUser = await dao.findOne({ email });

    if (existingUser) {
      return res.status(400).send({ message: 'User with this email already exists' });
    }

    // Cria o hash da senha
    const passwordHash = await hash(password, 8);

    // Cria o usuário
    const user = await dao.createOne({
      email,
      name,
      role,
      passwordHash
    });

    // Remove o passwordHash da resposta
    const { passwordHash: _, ...userWithoutPassword } = user;

    return res.status(201).send({ 
      data: userWithoutPassword,
      message: 'User created successfully'
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};
