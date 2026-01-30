import * as XLSX from 'xlsx';
import { Patient, VipPatient } from '@/services/api/patients';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const exportPatientsToExcel = (patients: Patient[], vipPatients: VipPatient[]) => {
  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Aba 1: Todos os Pacientes
  const allPatientsData = patients.map((patient) => ({
    'Nome Completo': patient.fullName,
    'CPF': patient.cpf || 'N/A',
    'Telefone': patient.phone || 'N/A',
    'Total Gasto': Number(patient.totalSpent.toFixed(2)),
    'Total de Atendimentos': patient.appointmentCount,
    'Último Atendimento': patient.lastAppointmentDate 
      ? format(new Date(patient.lastAppointmentDate), 'dd/MM/yyyy', { locale: ptBR })
      : 'N/A',
  }));

  const ws1 = XLSX.utils.json_to_sheet(allPatientsData);
  ws1['!cols'] = [
    { wch: 35 }, // Nome Completo
    { wch: 15 }, // CPF
    { wch: 15 }, // Telefone
    { wch: 15 }, // Total Gasto
    { wch: 20 }, // Total de Atendimentos
    { wch: 18 }, // Último Atendimento
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'Todos os Pacientes');

  // Aba 2: Pacientes VIP
  if (vipPatients.length > 0) {
    const vipPatientsData = vipPatients.map((patient, index) => ({
      'Ranking': index + 1,
      'Nome Completo': patient.fullName,
      'CPF': patient.cpf || 'N/A',
      'Total Gasto': Number(patient.totalSpent.toFixed(2)),
      'Total Pago': Number(patient.totalPaid.toFixed(2)),
      'Total de Atendimentos': patient.appointmentCount,
      'Último Atendimento': patient.lastAppointmentDate 
        ? format(new Date(patient.lastAppointmentDate), 'dd/MM/yyyy', { locale: ptBR })
        : 'N/A',
    }));

    const ws2 = XLSX.utils.json_to_sheet(vipPatientsData);
    ws2['!cols'] = [
      { wch: 10 }, // Ranking
      { wch: 35 }, // Nome Completo
      { wch: 15 }, // CPF
      { wch: 15 }, // Total Gasto
      { wch: 15 }, // Total Pago
      { wch: 20 }, // Total de Atendimentos
      { wch: 18 }, // Último Atendimento
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Pacientes VIP');
  }

  // Gerar nome do arquivo com data e hora
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  const fileName = `relatorio-pacientes_${timestamp}.xlsx`;

  // Fazer download do arquivo
  XLSX.writeFile(wb, fileName);
};
