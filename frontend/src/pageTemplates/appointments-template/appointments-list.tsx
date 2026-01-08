import { Table } from '@/components/ui/table';
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

  const headers = [
    'Data',
    'Hora',
    'Paciente',
    'Médico',
    'Especialidade',
    'Convênio',
    'Procedimento(s)',
    'Valor dos Exames',
    'Valor Pago',
    'Forma(s) de Pagamento',
    'Usuário Responsável',
    'Status',
    'Ações',
  ];

  return (
    <div>
      <div className="border rounded-md overflow-x-auto">
        <Table headers={headers}>
          {mockAppointments.map((appointment) => {
            return (
              <AppointmentsTableRow
                key={appointment.cod_atendimento}
                appointment={appointment}
              />
            );
          })}
        </Table>
      </div>
    </div>
  );
};
