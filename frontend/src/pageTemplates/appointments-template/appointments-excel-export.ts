import * as XLSX from "xlsx";
import { Appointment } from "@/services/api/appointments";
import { format } from "date-fns";

export const exportAppointmentsToExcel = (appointments: Appointment[]) => {
  // Formatar os dados para o Excel conforme solicitação
  const data = appointments.map((appointment) => ({
    // 4. Formata a data para padrão brasileiro (03/03/2026)
    Data: appointment.appointmentDate
      ? format(new Date(appointment.appointmentDate), "dd/MM/yyyy")
      : "N/A",
    Horário: appointment.appointmentTime || "N/A",
    // 2. Adicionado a coluna STATUS
    STATUS: appointment.status || "N/A",
    Paciente: appointment.patient?.fullName || "N/A",
    "CPF Paciente": appointment.patient?.cpf || "N/A",
    Médico: appointment.doctor?.name || "N/A",
    CRM: appointment.doctor?.crm || "N/A",
    Procedimentos: appointment.examsRaw || "N/A",
    Convênio: appointment.insuranceName || "Particular",
    "Valor Exame": appointment.examValue
      ? Number(appointment.examValue.toFixed(2))
      : 0,
    "Valor Pago": appointment.paidValue
      ? Number(appointment.paidValue.toFixed(2))
      : 0,
    // ID e Pagamento foram REMOVIDOS daqui (Pontos 1 e 3)
  }));

  // Criar workbook e worksheet
  const ws = XLSX.utils.json_to_sheet(data);

  // Definir larguras das colunas (Ajustado para a nova ordem)
  const columnWidths = [
    { wch: 12 }, // Data
    { wch: 10 }, // Horário
    { wch: 15 }, // STATUS
    { wch: 35 }, // Paciente
    { wch: 15 }, // CPF Paciente
    { wch: 30 }, // Médico
    { wch: 12 }, // CRM
    { wch: 40 }, // Procedimentos
    { wch: 20 }, // Convênio
    { wch: 12 }, // Valor Exame
    { wch: 12 }, // Valor Pago
  ];
  ws["!cols"] = columnWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Atendimentos");

  const timestamp = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
  const fileName = `relatorio-atendimentos_${timestamp}.xlsx`;

  XLSX.writeFile(wb, fileName);
};
