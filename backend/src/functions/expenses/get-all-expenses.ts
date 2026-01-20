import { handleErrors } from "@/utils/handle-errors";
import { ExpenseDAO } from "@/DAO/expense";

export const getAllExpenses = async (req: any, res: any) => {
  try {
    const dao = new ExpenseDAO();

    const expenses = await dao.findMany(
      undefined,
      { date: 'desc' } // Ordena por data decrescente
    );

    return res.status(200).send({
      data: { expenses },
      message: 'Expenses retrieved successfully'
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};
