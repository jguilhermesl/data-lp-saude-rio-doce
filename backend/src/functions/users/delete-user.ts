import { handleErrors } from "@/utils/handle-errors";
import { UserDAO } from "@/DAO/user";

export const deleteUser = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const dao = new UserDAO();

    // Verifica se o usuário existe
    const existingUser = await dao.findById(id);

    if (!existingUser) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Impede que o usuário delete a si mesmo
    if (req.userState && req.userState.id === id) {
      return res.status(400).send({ message: 'You cannot delete your own account' });
    }

    // Deleta o usuário
    await dao.deleteOne({ id });

    return res.status(200).send({
      message: 'User deleted successfully'
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};
