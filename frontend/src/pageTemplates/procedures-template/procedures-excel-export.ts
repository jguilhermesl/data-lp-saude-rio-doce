import * as XLSX from 'xlsx';
import { Procedure, TopSellingProcedure, TopRevenueProcedure } from '@/services/api/procedures';
import { format } from 'date-fns';

export const exportProceduresToExcel = (
  procedures: Procedure[],
  topSelling: TopSellingProcedure[],
  topRevenue: TopRevenueProcedure[]
) => {
  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Aba 1: Todos os Procedimentos
  const allProceduresData = procedures.map((procedure) => ({
    'Procedimento': procedure.name,
    'Código': procedure.code || 'N/A',
    'Preço Padrão': Number(procedure.defaultPrice?.toFixed(2) || 0),
    'Vezes Realizado': procedure._count.appointmentProcedures,
  }));

  const ws1 = XLSX.utils.json_to_sheet(allProceduresData);
  ws1['!cols'] = [
    { wch: 40 }, // Procedimento
    { wch: 15 }, // Código
    { wch: 15 }, // Preço Padrão
    { wch: 18 }, // Vezes Realizado
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Todos os Procedimentos');

  // Aba 2: Top Mais Vendidos
  if (topSelling.length > 0) {
    const topSellingData = topSelling.map((procedure, index) => ({
      'Ranking': index + 1,
      'Procedimento': procedure.name,
      'Código': procedure.code || 'N/A',
      'Quantidade Vendida': procedure.quantitySold,
      'Vezes Realizado': procedure.timesOrdered,
      'Faturamento Total': Number(procedure.totalRevenue.toFixed(2)),
      'Preço Médio': Number(procedure.averagePrice.toFixed(2)),
      'Preço Padrão': procedure.defaultPrice ? Number(procedure.defaultPrice.toFixed(2)) : 'N/A',
    }));

    const ws2 = XLSX.utils.json_to_sheet(topSellingData);
    ws2['!cols'] = [
      { wch: 10 }, // Ranking
      { wch: 40 }, // Procedimento
      { wch: 15 }, // Código
      { wch: 18 }, // Quantidade Vendida
      { wch: 18 }, // Vezes Realizado
      { wch: 18 }, // Faturamento Total
      { wch: 15 }, // Preço Médio
      { wch: 15 }, // Preço Padrão
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Mais Vendidos');
  }

  // Aba 3: Top Faturamento
  if (topRevenue.length > 0) {
    const topRevenueData = topRevenue.map((procedure, index) => ({
      'Ranking': index + 1,
      'Procedimento': procedure.name,
      'Código': procedure.code || 'N/A',
      'Faturamento Total': Number(procedure.totalRevenue.toFixed(2)),
      'Quantidade Vendida': procedure.quantitySold,
      'Vezes Realizado': procedure.timesOrdered,
      'Preço Médio': Number(procedure.averagePrice.toFixed(2)),
      'Preço Padrão': procedure.defaultPrice ? Number(procedure.defaultPrice.toFixed(2)) : 'N/A',
    }));

    const ws3 = XLSX.utils.json_to_sheet(topRevenueData);
    ws3['!cols'] = [
      { wch: 10 }, // Ranking
      { wch: 40 }, // Procedimento
      { wch: 15 }, // Código
      { wch: 18 }, // Faturamento Total
      { wch: 18 }, // Quantidade Vendida
      { wch: 18 }, // Vezes Realizado
      { wch: 15 }, // Preço Médio
      { wch: 15 }, // Preço Padrão
    ];
    XLSX.utils.book_append_sheet(wb, ws3, 'Maior Faturamento');
  }

  // Gerar nome do arquivo com data e hora
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const fileName = `relatorio-procedimentos_${timestamp}.xlsx`;

  // Fazer download do arquivo
  XLSX.writeFile(wb, fileName);
};
