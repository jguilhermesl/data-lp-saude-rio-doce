import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { PatientMetricsSummary, Patient, VipPatient } from '@/services/api/patients';
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
    width: '18%',
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
    fontSize: 8,
    color: '#334155',
  },
  tableCellBold: {
    fontWeight: 700,
    color: '#1e293b',
  },
  col1: { width: '30%' }, // Nome
  col2: { width: '15%' }, // CPF
  col3: { width: '15%' }, // Telefone
  col4: { width: '15%' }, // Total Gasto
  col5: { width: '12%' }, // Atendimentos
  col6: { width: '13%' }, // Último Atendimento
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

interface PatientsPDFReportProps {
  summary: PatientMetricsSummary;
  patients: Patient[];
  vipPatients: VipPatient[];
  dateRange?: DateRange;
  search?: string;
}

export const PatientsPDFReport = ({
  summary,
  patients,
  vipPatients,
  dateRange,
  search,
}: PatientsPDFReportProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatSimpleDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const periodText = dateRange?.from && dateRange?.to
    ? `${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`
    : 'Período não especificado';

  // Dividir pacientes em páginas (máximo 20 por página)
  const itemsPerPage = 20;
  const pages = Math.ceil(patients.length / itemsPerPage);

  return (
    <Document>
      {/* Primeira Página: Métricas e VIPs */}
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Pacientes</Text>
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
              <Text style={styles.metricLabel}>Total de Pacientes</Text>
              <Text style={styles.metricValue}>{summary.totalPatients}</Text>
              <Text style={styles.metricDescription}>
                Cadastrados
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Recorrentes</Text>
              <Text style={styles.metricValue}>{summary.recurringPatients}</Text>
              <Text style={styles.metricDescription}>
                Com múltiplos atendimentos
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Pacientes VIP</Text>
              <Text style={styles.metricValue}>{summary.vipPatientsCount}</Text>
              <Text style={styles.metricDescription}>
                Alto valor
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Em Risco</Text>
              <Text style={styles.metricValue}>{summary.patientsAtRiskCount}</Text>
              <Text style={styles.metricDescription}>
                Sem atendimentos recentes
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Taxa de Churn</Text>
              <Text style={styles.metricValue}>{summary.churnRate.toFixed(1)}%</Text>
              <Text style={styles.metricDescription}>
                Perda de pacientes
              </Text>
            </View>
          </View>
        </View>

        {/* Top Pacientes VIP */}
        {vipPatients.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top 10 Pacientes VIP (Maior Valor)</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>
                  Nome
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col2]}>
                  CPF
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col4]}>
                  Total Gasto
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col4]}>
                  Total Pago
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col5]}>
                  Atendimentos
                </Text>
              </View>

              {vipPatients.slice(0, 10).map((patient, index) => (
                <View
                  key={patient.patientId}
                  style={[
                    styles.tableRow,
                    ...(index % 2 === 0 ? [styles.tableRowEven] : []),
                  ]}
                >
                  <Text style={[styles.tableCell, styles.col1]}>
                    {patient.fullName}
                  </Text>
                  <Text style={[styles.tableCell, styles.col2]}>
                    {patient.cpf || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, styles.col4]}>
                    {formatCurrency(patient.totalSpent)}
                  </Text>
                  <Text style={[styles.tableCell, styles.col4]}>
                    {formatCurrency(patient.totalPaid)}
                  </Text>
                  <Text style={[styles.tableCell, styles.col5]}>
                    {patient.appointmentCount}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

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

      {/* Segunda Página: Lista de Pacientes */}
      <Page size="A4" style={styles.page} orientation="landscape">
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Pacientes (continuação)</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Todos os Pacientes ({patients.length} registros)
          </Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>
                Nome
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col2]}>
                CPF
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col3]}>
                Telefone
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col4]}>
                Total Gasto
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col5]}>
                Atendimentos
              </Text>
              <Text style={[styles.tableCell, styles.tableCellBold, styles.col6]}>
                Último Atend.
              </Text>
            </View>

            {patients.slice(0, itemsPerPage).map((patient, index) => (
              <View
                key={patient.id}
                style={[
                  styles.tableRow,
                  ...(index % 2 === 0 ? [styles.tableRowEven] : []),
                ]}
              >
                <Text style={[styles.tableCell, styles.col1]}>
                  {patient.fullName}
                </Text>
                <Text style={[styles.tableCell, styles.col2]}>
                  {patient.cpf || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, styles.col3]}>
                  {patient.phone || 'N/A'}
                </Text>
                <Text style={[styles.tableCell, styles.col4]}>
                  {formatCurrency(patient.totalSpent)}
                </Text>
                <Text style={[styles.tableCell, styles.col5]}>
                  {patient.appointmentCount}
                </Text>
                <Text style={[styles.tableCell, styles.col6]}>
                  {formatSimpleDate(patient.lastAppointmentDate)}
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

      {/* Páginas adicionais se necessário */}
      {pages > 1 && Array.from({ length: pages - 1 }, (_, pageIndex) => {
        const startIndex = (pageIndex + 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, patients.length);
        const pagePatients = patients.slice(startIndex, endIndex);

        return (
          <Page key={pageIndex + 1} size="A4" style={styles.page} orientation="landscape">
            <View style={styles.header}>
              <Text style={styles.title}>Relatório de Pacientes (continuação)</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>
                    Nome
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col2]}>
                    CPF
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col3]}>
                    Telefone
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col4]}>
                    Total Gasto
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col5]}>
                    Atendimentos
                  </Text>
                  <Text style={[styles.tableCell, styles.tableCellBold, styles.col6]}>
                    Último Atend.
                  </Text>
                </View>

                {pagePatients.map((patient, index) => (
                  <View
                    key={patient.id}
                    style={[
                      styles.tableRow,
                      ...(index % 2 === 0 ? [styles.tableRowEven] : []),
                    ]}
                  >
                    <Text style={[styles.tableCell, styles.col1]}>
                      {patient.fullName}
                    </Text>
                    <Text style={[styles.tableCell, styles.col2]}>
                      {patient.cpf || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.col3]}>
                      {patient.phone || 'N/A'}
                    </Text>
                    <Text style={[styles.tableCell, styles.col4]}>
                      {formatCurrency(patient.totalSpent)}
                    </Text>
                    <Text style={[styles.tableCell, styles.col5]}>
                      {patient.appointmentCount}
                    </Text>
                    <Text style={[styles.tableCell, styles.col6]}>
                      {formatSimpleDate(patient.lastAppointmentDate)}
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
