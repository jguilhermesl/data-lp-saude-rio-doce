import { handleErrors } from "@/utils/handle-errors";
import { z } from "zod";
import { ExpenseDAO } from "@/DAO/expense";

const updateExpenseSchema = z.object({
  payment: z.string().min(1, 'Payment type is required').optional(),
  value: z.number().positive('Value must be positive').optional(),
  month: z.string().min(1, 'Month is required').optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }).optional(),
  category: z.string().min(1, 'Category is required').optional(),
});

export const updateExpense = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const data = updateExpenseSchema.parse(req.body);

    const dao = new ExpenseDAO();

    // Verifica se a despesa existe
    const existingExpense = await dao.findById(id);

    if (!existingExpense) {
      return res.status(404).send({ message: 'Expense not found' });
    }

    // Prepara os dados para atualização
    const updateData: any = {};

    if (data.payment !== undefined) updateData.payment = data.payment;
    if (data.value !== undefined) updateData.value = data.value;
    if (data.month !== undefined) updateData.month = data.month;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    if (data.category !== undefined) updateData.category = data.category;

    // Atualiza a despesa
    const expense = await dao.updateOne(
      { id },
      updateData
    );

    return res.status(200).send({
      data: expense,
      message: 'Expense updated successfully'
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};
