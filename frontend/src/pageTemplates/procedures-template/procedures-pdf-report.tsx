import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { ProcedureMetricsSummary, Procedure, TopSellingProcedure, TopRevenueProcedure } from '@/services/api/procedures';
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
  highlightsSection: {
    marginBottom: 20,
  },
  highlightSubtitle: {
    fontSize: 12,
    fontWeight: 700,
    color: '#334155',
    marginBottom: 8,
    marginTop: 10,
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
  col1: { width: '35%' },
  col2: { width: '15%' },
  col3: { width: '15%' },
  col4: { width: '20%' },
  col5: { width: '15%' },
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

interface ProceduresPDFReportProps {
  summary: ProcedureMetricsSummary;
  procedures: Procedure[];
  topSelling: TopSellingProcedure[];
  topRevenue: TopRevenueProcedure[];
  dateRange?: DateRange;
  search?: string;
}

export const ProceduresPDFReport = ({
  summary,
  procedures,
  topSelling,
  topRevenue,
  dateRange,
  search,
}: ProceduresPDFReportProps) => {
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

  return (
    <Document>
      <Page size="A4" style={styles.page} orientation="landscape">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Relatório de Procedimentos</Text>
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
              <Text style={styles.metricLabel}>Total de Procedimentos</Text>
              <Text style={styles.metricValue}>{summary.totalProcedures}</Text>
            </View>
          </View>
        </View>

        {/* Top Mais Vendidos */}
        {topSelling.length > 0 && (
          <View style={styles.highlightsSection}>
            <Text style={styles.sectionTitle}>Top 10 Procedimentos Mais Vendidos</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>
                  Procedimento
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col2]}>
                  Código
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col3]}>
                  Qtd Vendida
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col4]}>
                  Faturamento
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col5]}>
                  Preço Médio
                </Text>
              </View>

              {topSelling.slice(0, 10).map((procedure, index) => (
                <View
                  key={procedure.procedureId}
                  style={[
                    styles.tableRow,
                    ...(index % 2 === 0 ? [styles.tableRowEven] : []),
                  ]}
                >
                  <Text style={[styles.tableCell, styles.col1]}>
                    {procedure.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.col2]}>
                    {procedure.code || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, styles.col3]}>
                    {procedure.quantitySold}
                  </Text>
                  <Text style={[styles.tableCell, styles.col4]}>
                    {formatCurrency(procedure.totalRevenue)}
                  </Text>
                  <Text style={[styles.tableCell, styles.col5]}>
                    {formatCurrency(procedure.averagePrice)}
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

      {/* Segunda Página: Top Faturamento */}
      {topRevenue.length > 0 && (
        <Page size="A4" style={styles.page} orientation="landscape">
          <View style={styles.header}>
            <Text style={styles.title}>Relatório de Procedimentos (continuação)</Text>
          </View>

          <View style={styles.highlightsSection}>
            <Text style={styles.sectionTitle}>Top 10 Procedimentos por Faturamento</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col1]}>
                  Procedimento
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col2]}>
                  Código
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col4]}>
                  Faturamento
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col3]}>
                  Qtd Vendida
                </Text>
                <Text style={[styles.tableCell, styles.tableCellBold, styles.col5]}>
                  Preço Médio
                </Text>
              </View>

              {topRevenue.slice(0, 10).map((procedure, index) => (
                <View
                  key={procedure.procedureId}
                  style={[
                    styles.tableRow,
                    ...(index % 2 === 0 ? [styles.tableRowEven] : []),
                  ]}
                >
                  <Text style={[styles.tableCell, styles.col1]}>
                    {procedure.name}
                  </Text>
                  <Text style={[styles.tableCell, styles.col2]}>
                    {procedure.code || 'N/A'}
                  </Text>
                  <Text style={[styles.tableCell, styles.col4]}>
                    {formatCurrency(procedure.totalRevenue)}
                  </Text>
                  <Text style={[styles.tableCell, styles.col3]}>
                    {procedure.quantitySold}
                  </Text>
                  <Text style={[styles.tableCell, styles.col5]}>
                    {formatCurrency(procedure.averagePrice)}
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
      )}
    </Document>
  );
};
