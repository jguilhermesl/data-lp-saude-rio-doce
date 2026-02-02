export interface Appointment {
  id: string;
  appointmentDate: string;
  appointmentTime?: string;
  examValue?: number;
  paidValue?: number;
  paymentDone: boolean;
  insuranceName?: string;
  doctor: {
    id: string;
    name: string;
    crm?: string;
  } | null;
  specialty: {
    id: string;
    name: string;
  } | null;
  appointmentProcedures: Array<{
    procedure: {
      id: string;
      name: string;
      code?: string;
    };
  }>;
  examsRaw: string
}