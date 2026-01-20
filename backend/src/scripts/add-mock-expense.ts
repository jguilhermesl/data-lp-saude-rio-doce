import { prisma } from '../lib/prisma';

async function addMockExpenses() {
  try {
    console.log('Adding mock expenses...');

    const expenses = [
      {
        payment: 'Salário Equipe Médica',
        value: 25000.00,
        month: 'Janeiro/2026',
        date: new Date('2026-01-05'),
        category: 'Salários',
      },
      {
        payment: 'INSS e Encargos',
        value: 7500.00,
        month: 'Janeiro/2026',
        date: new Date('2026-01-10'),
        category: 'Impostos',
      },
      {
        payment: 'Aluguel do Consultório',
        value: 3500.00,
        month: 'Janeiro/2026',
        date: new Date('2026-01-15'),
        category: 'Aluguel',
      },
      {
        payment: 'Equipamento de Ultrassom',
        value: 12000.00,
        month: 'Janeiro/2026',
        date: new Date('2026-01-08'),
        category: 'Equipamentos',
      },
      {
        payment: 'Materiais Médicos',
        value: 4200.00,
        month: 'Janeiro/2026',
        date: new Date('2026-01-12'),
        category: 'Materiais',
      },
      {
        payment: 'Limpeza e Manutenção',
        value: 1800.00,
        month: 'Janeiro/2026',
        date: new Date('2026-01-18'),
        category: 'Serviços',
      },
    ];

    for (const expenseData of expenses) {
      const expense = await prisma.expense.create({
        data: expenseData,
      });
      console.log('Mock expense created:', expense.payment);
    }

    console.log('\nAll mock expenses created successfully!');
  } catch (error) {
    console.error('Error adding mock expenses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMockExpenses();
