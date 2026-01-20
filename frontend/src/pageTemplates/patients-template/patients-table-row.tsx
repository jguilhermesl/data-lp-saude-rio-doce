'use client';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MessageCircle, Eye } from 'lucide-react';
import { Patient } from '@/services/api/patients';
import { useRouter } from 'next/navigation';

interface PatientsTableRowProps {
  patient: Patient;
}

export const PatientsTableRow = ({ patient }: PatientsTableRowProps) => {
  const router = useRouter();
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-';
    // Remove caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Formata para (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const handleWhatsApp = () => {
    if (!patient.phone) return;
    
    // Remove caracteres não numéricos
    const phoneNumber = patient.phone.replace(/\D/g, '');
    
    // Adiciona código do país (55 para Brasil) se necessário
    const fullNumber = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`;
    
    // Abre WhatsApp em nova aba
    window.open(`https://wa.me/${fullNumber}`, '_blank');
  };

  return (
    <Table.Row>
      <Table.Col className="font-medium">{patient.fullName}</Table.Col>
      <Table.Col className="font-medium">{formatPhone(patient.phone)}</Table.Col>
      <Table.Col className="font-medium">
        {formatCurrency(patient.totalSpent)}
      </Table.Col>
      <Table.Col className="font-medium">{patient.appointmentCount}</Table.Col>
      <Table.Col className="font-medium">
        {formatDate(patient.lastAppointmentDate)}
      </Table.Col>
      <Table.Col>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push(`/patient/${patient.id}`)}
          >
            <Eye className="mr-2 h-3 w-3" />
            Ver detalhes
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleWhatsApp}
            disabled={!patient.phone}
            title={patient.phone ? 'Enviar mensagem no WhatsApp' : 'Telefone não disponível'}
          >
            <MessageCircle className="mr-2 h-3 w-3" />
            WhatsApp
          </Button>
        </div>
      </Table.Col>
    </Table.Row>
  );
};
