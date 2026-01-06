import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AppointmentsTableRow } from './appointments-table-row';

export const AppointmentsList = () => {
  // TODO: Replace with real API data
  const mockAppointments = Array.from({ length: 10 }).map((_, i) => ({
    hii_cod_atendimento: `${8077 + i}`,
    cod_atendimento: `${8077 + i}`,
    hid_status: 'F',
    status: 'F',
    status_obs: 'NAO DESTACAR',
    txt_usuario_responsavel: 'PATRICIA OLIVEIRA',
    paciente: `PACIENTE ${i + 1}`,
    medico: 'ANDRE FELIPE DA SILVA MACEDO',
    dat_atendimento: '03/12/2025',
    hora_atendimento: '13:48:51',
    dat_criacao: '03/12/2025',
    convenio: 'PARTICULAR',
    vlr_exames: '140.00',
    vlr_pago: '140.00',
    exames: 'CONSULTA CARDIOLOGISTA',
    pagamentos_realizados: 'CARTAO DEBITO (140.00)',
    statusAtend:
      '<span class="btn btn-success btn-sm"><strong>FECHADO</strong></span>',
  }));

  return (
    <div>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Hora</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Médico</TableHead>
              <TableHead>Especialidade</TableHead>
              <TableHead>Convênio</TableHead>
              <TableHead>Procedimento(s)</TableHead>
              <TableHead>Valor dos Exames</TableHead>
              <TableHead>Valor Pago</TableHead>
              <TableHead>Forma(s) de Pagamento</TableHead>
              <TableHead>Usuário Responsável</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAppointments.map((appointment) => {
              return (
                <AppointmentsTableRow
                  key={appointment.cod_atendimento}
                  appointment={appointment}
                />
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
