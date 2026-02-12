import { handleErrors } from "@/utils/handle-errors";
import { z } from "zod";
import { ExpenseDAO } from "@/DAO/expense";

const createExpenseSchema = z.object({
  payment: z.string().min(1, 'Payment type is required'),
  value: z.number().positive('Value must be positive'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  category: z.string().min(1, 'Category is required'),
});

export const createExpense = async (req: any, res: any) => {
  try {
    const { payment, value, date, category } = createExpenseSchema.parse(req.body);

    const dao = new ExpenseDAO();

    // Converte a data considerando o timezone brasileiro (UTC-3)
    // Isso garante que a data seja salva corretamente sem mudança de dia
    const parsedDate = new Date(date);
    const localDate = new Date(parsedDate.getTime() + parsedDate.getTimezoneOffset() * 60000);

    // Cria a despesa
    const expense = await dao.createOne({
      payment,
      value,
      date: localDate,
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
