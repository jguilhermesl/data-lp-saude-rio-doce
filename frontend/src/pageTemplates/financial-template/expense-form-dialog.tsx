/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
  Expense,
  expensesApi,
  CreateExpenseData,
} from '@/services/api/expenses';
import { toast } from 'sonner';

// Helpers
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

interface ExpenseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  expense?: Expense | null;
}

export const ExpenseFormDialog = ({
  isOpen,
  onClose,
  onSuccess,
  expense,
}: ExpenseFormDialogProps) => {
  const [formData, setFormData] = useState<CreateExpenseData>({
    payment: '',
    value: 0,
    date: '',
    category: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'MÉDICO',
    'TERCEIROS',
    'MARKETING',
    'INSUMOS',
    'FUNCIONÁRIO',
    'ESTORNO',
    'TROCO',
    'FAXINA',
    'LABORATÓRIO',
    'SEGURANÇA',
    'CONTADOR',
    'EMPRÉSTIMO',
    'SISTEMA',
    'IMPOSTO',
    'ALUGUEL',
    'ENERGIA',
    'ROYALTIES',
    'INTERNET',
    'MAQUINÁRIO',
    'CONSÓRCIO',
    'SEGURO',
    'CONSULTORIA',
    'LIXO',
    'TARIFA',
    'OUTROS',
  ];

  useEffect(() => {
    if (expense) {
      setFormData({
        payment: expense.payment,
        value: expense.value,
        date: expense.date.split('T')[0],
        category: expense.category,
      });
    } else {
      setFormData({
        payment: '',
        value: 0,
        date: getTodayDate(),
        category: '',
      });
    }
  }, [expense, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.payment ||
      !formData.value ||
      !formData.date ||
      !formData.category
    ) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      setIsSubmitting(true);

      if (expense) {
        await expensesApi.update(expense.id, formData);
        toast.success('Despesa atualizada com sucesso!');
      } else {
        await expensesApi.create(formData);
        toast.success('Despesa criada com sucesso!');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          'Erro ao salvar despesa. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) || 0 : value,
    }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numberValue = Number(rawValue) / 100;

    setFormData((prev) => ({
      ...prev,
      value: numberValue || 0,
    }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {expense ? 'Editar Despesa' : 'Nova Despesa'}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pagamento <span className="text-red-500">*</span>
            </label>
            <input
              name="payment"
              value={formData.payment}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Fornecedor XYZ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor <span className="text-red-500">*</span>
            </label>
            <input
              value={formatCurrency(formData.value)}
              onChange={handleValueChange}
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoria <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full rounded-md border px-3 py-2 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : expense ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
