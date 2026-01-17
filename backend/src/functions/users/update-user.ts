import { handleErrors } from "@/utils/handle-errors";
import { z } from "zod";
import { hash } from "bcrypt";
import { UserDAO } from "@/DAO/user";

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'VIEWER']).optional(),
  active: z.boolean().optional(),
  phone: z.string().optional()
});

export const updateUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    const dao = new UserDAO();

    // Verifica se o usuário existe
    const existingUser = await dao.findById(id);

    if (!existingUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Se o email foi alterado, verifica se já existe outro usuário com este email
    if (data.email && data.email !== existingUser.email) {
      const userWithEmail = await dao.findByEmail(data.email);
      if (userWithEmail) {
        return res.status(400).send({ message: 'User with this email already exists' });
      }
    }

    // Prepara os dados para atualização
    const updateData: any = {};

    if (data.email) updateData.email = data.email;
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.phone !== undefined) updateData.phone = data.phone;

    // Se a senha foi fornecida, cria o hash
    if (data.password) {
      updateData.passwordHash = await hash(data.password, 8);
    }

    // Atualiza o usuário
    const updatedUser = await dao.updateOne({ id }, updateData);

    // Remove o passwordHash da resposta
    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    return res.status(200).send({
      data: userWithoutPassword,
      message: 'User updated successfully'
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};
