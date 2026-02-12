import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface BirthdayPerson {
  externalId: string;
  day: string;
  name: string;
  birthDate: string;
  age: string;
  lastAppointment: string;
  daysSinceLastAppointment: string;
  email: string;
  phone: string;
  patientId: string | null;
  patientData: {
    id: string;
    fullName: string;
    cpf: string | null;
    mobilePhone: string | null;
    homePhone: string | null;
  } | null;
}

interface BirthdaysResponse {
  success: boolean;
  data: {
    date: string;
    day: number;
    month: number;
    total: number;
    birthdays: BirthdayPerson[];
  };
}

export function useBirthdays(date?: string) {
  return useQuery<BirthdaysResponse>({
    queryKey: ['birthdays', date],
    queryFn: async () => {
      const params = date ? { date } : {};
      const response = await api.get('/patients/birthdays', { params });
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
