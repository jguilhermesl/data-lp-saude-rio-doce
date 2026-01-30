import * as XLSX from 'xlsx';
import { Appointment } from '@/services/api/appointments';
import { format } from 'date-fns';

export const exportAppointmentsToExcel = (appointments: Appointment[]) => {
  // Formatar os dados para o Excel
  const data = appointments.map((appointment) => ({
    'ID': appointment.externalId,
    'Data': appointment.appointmentDate,
    'Horário': appointment.appointmentTime || 'N/A',
    'Paciente': appointment.patient?.fullName || 'N/A',
    'CPF Paciente': appointment.patient?.cpf || 'N/A',
    'Médico': appointment.doctor?.name || 'N/A',
    'CRM': appointment.doctor?.crm || 'N/A',
    'Especialidade': appointment.specialty?.name || 'N/A',
    'Convênio': appointment.insuranceName || 'Particular',
    'Valor Exame': appointment.examValue ? Number(appointment.examValue.toFixed(2)) : 0,
    'Valor Pago': appointment.paidValue ? Number(appointment.paidValue.toFixed(2)) : 0,
    'Pagamento': appointment.paymentDone ? 'Pago' : 'Pendente',
    'Procedimentos': appointment.procedures.map(p => p.name).join(', ') || 'N/A',
  }));

  // Criar workbook e worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Definir larguras das colunas
  const columnWidths = [
    { wch: 15 }, // ID
    { wch: 12 }, // Data
    { wch: 10 }, // Horário
    { wch: 30 }, // Paciente
    { wch: 15 }, // CPF Paciente
    { wch: 30 }, // Médico
    { wch: 12 }, // CRM
    { wch: 25 }, // Especialidade
    { wch: 20 }, // Convênio
    { wch: 12 }, // Valor Exame
    { wch: 12 }, // Valor Pago
    { wch: 12 }, // Pagamento
    { wch: 40 }, // Procedimentos
  ];
  ws['!cols'] = columnWidths;

  // Criar workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Atendimentos');

  // Gerar nome do arquivo com data e hora
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const fileName = `relatorio-atendimentos_${timestamp}.xlsx`;

  // Fazer download do arquivo
  XLSX.writeFile(wb, fileName);
};
