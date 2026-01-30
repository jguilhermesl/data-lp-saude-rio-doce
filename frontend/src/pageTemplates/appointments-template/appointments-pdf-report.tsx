import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { AppointmentMetricsSummary, Appointment } from '@/services/api/appointments';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type DateRange } from 'react-day-picker';

// Registrar fontes
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 3,
    borderBottomStyle: 'solid',
    borderBottomColor: '#2563eb',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 3,
  },
  periodInfo: {
    fontSize: 10,
    color: '#475569',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#334155',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#e2e8f0',
    paddingBottom: 5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  metricCard: {
    width: '23%',
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#e2e8f0',
  },
  metricLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: 500,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e293b',
  },
  metricDescription: {
    fontSize: 7,
    color: '#94a3b8',
    marginTop: 3,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: '#cbd5e1',
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: '#e2e8f0',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tableRowEven: {
    backgroundColor: '#f8fafc',
  },
  tableCell: {
    fontSize: 7,
    color: '#334155',
  },
  tableCellBold: {
    fontWeight: 700,
    color: '#1e293b',
  },
  col1: { width: '10%' }, // Data
  col2: { width: '20%' }, // Paciente
  col3: { width: '20%' }, // Médico
  col4: { width: '15%' }, // Especialidade
  col5: { width: '15%' }, // Convênio
  col6: { width: '10%' }, // Valor
  col7: { width: '10%' }, // Status
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#64748b',
  },
  pageNumber: {
    fontSize: 8,
    color: '#64748b',
  },
});

interface AppointmentsPDFReportProps {
  summary: AppointmentMetricsSummary;
  appointments: Appointment[];
  dateRange?: DateRange;
  search?: string;
}

export const AppointmentsPDFReport = ({
  summary,
  appointments,
  dateRange,
  search,
}: AppointmentsPDFReportProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const periodText = dateRange?.from && dateRange?.to
    ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
    : 'Período não especificado';

  // Dividir atendimentos em páginas (máximo 20 por página)
  const itemsPerPage = 20;
  const pages = Math.ceil(appointments.length / itemsPerPage);

  return (
    <Document>
      {/* Primeira Página: Métricas e início da listagem */}
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Atendimentos</Text>
          <Text style={styles.subtitle}>
            Sistema de Gestão - Saúde Rio Doce
          </Text>
          <Text style={styles.periodInfo}>Período: {periodText}</Text>
          {search && (
            <Text style={styles.periodInfo}>Filtro aplicado: {search}</Text>
          )}
          <Text style={styles.periodInfo}>
            Gerado em: {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </Text>
        </View>

        {/* Métricas Gerais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visão Geral - Métricas do Período</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Total de Atendimentos</Text>
              <Text style={styles.metricValue}>{summary.totalAppointments}</Text>
              <Text style={styles.metricDescription}>
                No período selecionado
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Faturamento Total</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(summary.totalRevenue)}
              </Text>
              <Text style={styles.metricDescription}>
                Receita do período
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Ticket Médio</Text>
              <Text style={styles.metricValue}>
                {formatCurrency(summary.averageTicket)}
              </Text>
              <Text style={styles.metricDescription}>
                Por atendimento
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Atendimentos Hoje</Text>
              <Text style={styles.metricValue}>{summary.todayAppointments}</Text>
              <Text style={styles.metricDescription}>
                Agendados para hoje
              </Text>
            </View>
          </View>
        </View>

        {/* Tabela de Atendimentos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Detalhamento dos Atendimentos ({appointments.length} registros)
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>
                Data
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col2]}>
                Paciente
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col3]}>
                Médico
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col4]}>
                Especialidade
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col5]}>
                Convênio
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col6]}>
                Valor
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col7]}>
                Status
              </Text>
            </View>

            {appointments.slice(0, itemsPerPage).map((appointment, index) => (
              <View
                key={appointment.id}
                style={[
                  styles.tableRow,
                  ...(index % 2 === 0 ? [styles.tableRowEven] : []),
                ]}
              >
                <Text style={[styles.tableCell, styles.col1]}>
                  {appointment.appointmentDate}
                </Text>
                <Text style={[styles.tableCell, styles.col2]}>
                  {appointment.patient?.fullName || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, styles.col3]}>
                  {appointment.doctor?.name || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, styles.col4]}>
                  {appointment.specialty?.name || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, styles.col5]}>
                  {appointment.insuranceName || 'Particular'}
                </Text>
                <Text style={[styles.tableCell, styles.col6]}>
                  {appointment.examValue ? formatCurrency(appointment.examValue) : 'N/A'}
                </Text>
                <Text style={[styles.tableCell, styles.col7]}>
                  {appointment.paymentDone ? 'Pago' : 'Pendente'}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Relatório gerado automaticamente pelo Sistema de Gestão
          </Text>
          <Text
            style={styles.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>

      {/* Páginas adicionais */}
      {pages > 1 && Array.from({ length: pages - 1 }, (_, pageIndex) => {
        const startIndex = (pageIndex + 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, appointments.length);
        const pageAppointments = appointments.slice(startIndex, endIndex);

        return (
          <Page key={pageIndex + 1} size="A4" style={styles.page} orientation="landscape">
            <View style={styles.header}>
              <Text style={styles.title}>Relatório de Atendimentos (continuação)</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>
                    Data
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col2]}>
                    Paciente
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col3]}>
                    Médico
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col4]}>
                    Especialidade
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col5]}>
                    Convênio
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col6]}>
                    Valor
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col7]}>
                    Status
                  </Text>
                </View>

                {pageAppointments.map((appointment, index) => (
                  <View
                    key={appointment.id}
                    style={[
                      styles.tableRow,
                      ...(index % 2 === 0 ? [styles.tableRowEven] : []),
                    ]}
                  >
                    <Text style={[styles.tableCell, styles.col1]}>
                      {appointment.appointmentDate}
                    </Text>
                    <Text style={[styles.tableCell, styles.col2]}>
                      {appointment.patient?.fullName || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.col3]}>
                      {appointment.doctor?.name || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.col4]}>
                      {appointment.specialty?.name || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.col5]}>
                      {appointment.insuranceName || 'Particular'}
                    </Text>
                    <Text style={[styles.tableCell, styles.col6]}>
                      {appointment.examValue ? formatCurrency(appointment.examValue) : 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.col7]}>
                      {appointment.paymentDone ? 'Pago' : 'Pendente'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.footer} fixed>
              <Text style={styles.footerText}>
                Relatório gerado automaticamente pelo Sistema de Gestão
              </Text>
              <Text
                style={styles.pageNumber}
                render={({ pageNumber, totalPages }) =>
                  `Página ${pageNumber} de ${totalPages}`
                }
              />
            </View>
          </Page>
        );
      })}
    </Document>
  );
};
