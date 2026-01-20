import { handleErrors } from "@/utils/handle-errors";
import { z } from "zod";
import { ExpenseDAO } from "@/DAO/expense";

const createExpenseSchema = z.object({
  payment: z.string().min(1, 'Payment type is required'),
  value: z.number().positive('Value must be positive'),
  month: z.string().min(1, 'Month is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  category: z.string().min(1, 'Category is required'),
});

export const createExpense = async (req: any, res: any) => {
  try {
    const { payment, value, month, date, category } = createExpenseSchema.parse(req.body);

    const dao = new ExpenseDAO();

    // Cria a despesa
    const expense = await dao.createOne({
      payment,
      value,
      month,
      date: new Date(date),
      category,
    });

    return res.status(201).send({
      data: expense,
      message: 'Expense created successfully'
    });
  } catch (err) {
    const errorMessage = handleErrors(err);
    return res.status(500).send({ message: errorMessage });
  }
};
