import { handleErrors } from "@/utils/handle-errors";
import { ExpenseDAO } from "@/DAO/expense";

export const deleteExpense = async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const dao = new ExpenseDAO();

    // Verifica se a despesa existe
    const existingExpense = await dao.findById(id);

    if (!existingExpense) {
      return res.status(404).send({ message: 'Expense not found' });
    }

    // Deleta a despesa
    await dao.deleteOne({ id });

    return res.status(200).send({
      message: 'Expense deleted successfully'
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};
