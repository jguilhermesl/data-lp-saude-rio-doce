import * as XLSX from 'xlsx';
import { DoctorMetrics } from '@/services/api/doctors';
import { format } from 'date-fns';

export const exportDoctorsToExcel = (doctors: DoctorMetrics[]) => {
  // Formatar os dados para o Excel
  const data = doctors.map((doctor) => ({
    'Médico': doctor.name,
    'CRM': doctor.crm,
    'Especialidade(s)': doctor.specialties.map((s) => s.name).join(', ') || 'N/A',
    'Total de Atendimentos': doctor.appointmentCount,
    'Taxa de Retorno (%)': Number(doctor.returnRate.toFixed(2)),
    'Faturamento Total': Number(doctor.totalRevenue.toFixed(2)),
    'Ticket Médio': Number(doctor.averageTicket.toFixed(2)),
  }));

  // Criar workbook e worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Definir larguras das colunas
  const columnWidths = [
    { wch: 30 }, // Médico
    { wch: 12 }, // CRM
    { wch: 30 }, // Especialidade(s)
    { wch: 20 }, // Total de Atendimentos
    { wch: 18 }, // Taxa de Retorno (%)
    { wch: 18 }, // Faturamento Total
    { wch: 15 }, // Ticket Médio
  ];
  ws['!cols'] = columnWidths;

  // Criar workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Médicos');

  // Gerar nome do arquivo com data e hora
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const fileName = `relatorio-medicos_${timestamp}.xlsx`;

  // Fazer download do arquivo
  XLSX.writeFile(wb, fileName);
};
