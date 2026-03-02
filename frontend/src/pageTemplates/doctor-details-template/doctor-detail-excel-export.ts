import * as XLSX from 'xlsx';
import { format } from 'date-fns';

interface Procedure {
  id: string;
  name: string;
  code?: string;
  quantity?: number;
}

interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime?: string;
  examValue?: number;
  paidValue?: number;
  paymentDone: boolean;
  insuranceName?: string;
  patient: {
    id: string;
    fullName: string;
    cpf?: string;
  } | null;
  procedures: Procedure[];
}

interface DoctorExportData {
  doctorName: string;
  crm?: string;
  appointments: Appointment[];
  totalRevenue: number;
  totalAppointments: number;
  averageTicket: number;
}

export const exportDoctorDetailToExcel = (data: DoctorExportData) => {
  // Formatar os dados dos atendimentos para o Excel
  const appointmentsData = data.appointments.map((appointment) => ({
    'Data': format(new Date(appointment.appointmentDate), 'dd/MM/yyyy'),
    'Horário': appointment.appointmentTime || 'N/A',
    'Paciente': appointment.patient?.fullName || 'N/A',
    'CPF': appointment.patient?.cpf || 'N/A',
    'Convênio': appointment.insuranceName || 'Particular',
    'Procedimentos': appointment.procedures.map((p) => p.name).join(', ') || 'N/A',
    'Valor do Exame': appointment.examValue ? Number(appointment.examValue.toFixed(2)) : 0,
    'Valor Pago': appointment.paidValue ? Number(appointment.paidValue.toFixed(2)) : 0,
    'Status Pagamento': appointment.paymentDone ? 'Pago' : 'Pendente',
  }));

  // Criar resumo
  const summaryData = [
    {
      'Métrica': 'Médico',
      'Valor': data.doctorName,
    },
    {
      'Métrica': 'CRM',
      'Valor': data.crm || 'N/A',
    },
    {
      'Métrica': 'Total de Atendimentos',
      'Valor': data.totalAppointments,
    },
    {
      'Métrica': 'Faturamento Total',
      'Valor': Number(data.totalRevenue.toFixed(2)),
    },
    {
      'Métrica': 'Ticket Médio',
      'Valor': Number(data.averageTicket.toFixed(2)),
    },
  ];

  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Adicionar aba de resumo
  const wsSummary = XLSX.utils.json_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumo');

  // Adicionar aba de atendimentos
  const wsAppointments = XLSX.utils.json_to_sheet(appointmentsData);
  wsAppointments['!cols'] = [
    { wch: 12 }, // Data
    { wch: 10 }, // Horário
    { wch: 30 }, // Paciente
    { wch: 15 }, // CPF
    { wch: 20 }, // Convênio
    { wch: 40 }, // Procedimentos
    { wch: 15 }, // Valor do Exame
    { wch: 15 }, // Valor Pago
    { wch: 18 }, // Status Pagamento
  ];
  XLSX.utils.book_append_sheet(wb, wsAppointments, 'Atendimentos');

  // Gerar nome do arquivo com data e hora
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const fileName = `relatorio-medico-${data.doctorName.replace(/\s+/g, '-').toLowerCase()}_${timestamp}.xlsx`;

  // Fazer download do arquivo
  XLSX.writeFile(wb, fileName);
};
