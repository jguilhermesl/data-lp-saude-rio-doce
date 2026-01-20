import * as XLSX from 'xlsx';
import { FinancialMetricsResponse } from '@/services/api/financial';
import { format } from 'date-fns';

export const exportFinancialToExcel = (data: FinancialMetricsResponse) => {
  const wb = XLSX.utils.book_new();

  // Aba 1: Resumo
  const summaryData = [
    { 'Métrica': 'Faturamento Total', 'Valor': Number(data.summary.totalRevenue.toFixed(2)) },
    { 'Métrica': 'Despesas Totais', 'Valor': Number(data.summary.totalExpenses.toFixed(2)) },
    { 'Métrica': 'Lucro Total', 'Valor': Number(data.summary.totalProfit.toFixed(2)) },
  ];
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

  // Aba 2: Ranking de Categorias
  if (data.categoryRanking.length > 0) {
    const categoryData = data.categoryRanking.map((item) => ({
      'Categoria': item.category,
      'Total': Number(item.totalValue.toFixed(2)),
      'Quantidade': item.count,
      'Percentual (%)': Number(item.percentage.toFixed(2)),
    }));
    const wsCategory = XLSX.utils.json_to_sheet(categoryData);
    wsCategory['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsCategory, 'Ranking Categorias');
  }

  // Aba 3: Série Temporal (se houver)
  if (data.timeSeries.length > 0) {
    const timeSeriesData = data.timeSeries.map((item) => ({
      'Período': item.period,
      'Faturamento': Number(item.revenue.toFixed(2)),
      'Despesas': Number(item.expenses.toFixed(2)),
      'Lucro': Number(item.profit.toFixed(2)),
    }));
    const wsTimeSeries = XLSX.utils.json_to_sheet(timeSeriesData);
    wsTimeSeries['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, wsTimeSeries, 'Evolução Mensal');
  }

  // Aba 4: Despesas Detalhadas
  const expensesData = data.expenses.map((expense) => ({
    'Data': format(new Date(expense.date), 'dd/MM/yyyy'),
    'Pagamento': expense.payment,
    'Categoria': expense.category,
    'Valor': Number(expense.value.toFixed(2)),
  }));
  const wsExpenses = XLSX.utils.json_to_sheet(expensesData);
  wsExpenses['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Despesas');

  // Gerar nome do arquivo com data e hora
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const fileName = `relatorio-financeiro_${timestamp}.xlsx`;

  // Fazer download do arquivo
  XLSX.writeFile(wb, fileName);
};
