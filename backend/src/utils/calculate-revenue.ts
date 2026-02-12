/**
 * Interface para appointment com os campos necessários para cálculo de faturamento
 * Aceita tanto number quanto Decimal (tipo do Prisma)
 */
interface AppointmentForRevenue {
  paidValue: number | null | any; // any para aceitar Decimal do Prisma
  status: string | null;
  appointmentDate: Date;
  createdDate: Date | null;
}

/**
 * Verifica se um atendimento deve ser incluído no faturamento baseado nas regras de negócio
 * 
 * Regras:
 * - Se status === "PRÉ-PAGO ATENDIDO":
 *   1. Compara appointmentDate com createdDate
 *   2. Pega a DATA MAIS ANTIGA
 *   3. Verifica se essa data está no período selecionado
 *   4. Se SIM → entra no faturamento, Se NÃO → não entra no faturamento
 * 
 * - Para outros status:
 *   → Entram no faturamento normalmente (já filtrados pela query)
 * 
 * @param appointment - Atendimento a ser verificado
 * @param startDate - Data inicial do período
 * @param endDate - Data final do período
 * @returns true se o atendimento deve ser incluído no faturamento
 */
export function shouldIncludeInRevenue(
  appointment: AppointmentForRevenue,
  startDate: Date,
  endDate: Date
): boolean {
  // Regra especial para "PRÉ-PAGO ATENDIDO"
  if (appointment.status === 'PRÉ-PAGO ATENDIDO') {
    const appointmentDateObj = new Date(appointment.appointmentDate);
    const createdDateObj = appointment.createdDate ? new Date(appointment.createdDate) : null;
    
    // Pega a data mais antiga entre appointmentDate e createdDate
    const oldestDate = createdDateObj && createdDateObj < appointmentDateObj 
      ? createdDateObj 
      : appointmentDateObj;
    
    // Verifica se a data mais antiga está no período selecionado
    return oldestDate >= startDate && oldestDate <= endDate;
  }
  
  // Para outros status, sempre inclui (já foram filtrados pela query OR)
  return true;
}

/**
 * Calcula o faturamento total baseado em um array de atendimentos
 * 
 * @param appointments - Array de atendimentos
 * @param startDate - Data inicial do período
 * @param endDate - Data final do período
 * @returns Faturamento total calculado
 */
export function calculateTotalRevenue(
  appointments: AppointmentForRevenue[],
  startDate: Date,
  endDate: Date
): number {
  return appointments.reduce((sum, appointment) => {
    // Se não deve ser incluído no faturamento, retorna o total atual sem somar
    if (!shouldIncludeInRevenue(appointment, startDate, endDate)) {
      return sum;
    }
    
    // Calcula o valor pago (0 se for null)
    const paidValue = appointment.paidValue ? Number(appointment.paidValue) : 0;
    
    return sum + paidValue;
  }, 0);
}

/**
 * Filtra atendimentos que devem ser incluídos no faturamento
 * 
 * @param appointments - Array de atendimentos
 * @param startDate - Data inicial do período
 * @param endDate - Data final do período
 * @returns Array de atendimentos que devem ser incluídos no faturamento
 */
export function filterAppointmentsForRevenue(
  appointments: AppointmentForRevenue[],
  startDate: Date,
  endDate: Date
): AppointmentForRevenue[] {
  return appointments.filter(appointment => 
    shouldIncludeInRevenue(appointment, startDate, endDate)
  );
}
