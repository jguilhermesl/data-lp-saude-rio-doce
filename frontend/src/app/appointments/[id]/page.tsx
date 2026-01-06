import { AppointmentDetailsTemplate } from '@/pageTemplates/appointment-details-template';

interface AppointmentDetailsPageProps {
  params: {
    id: string;
  };
}

export default function AppointmentDetailsPage({
  params,
}: AppointmentDetailsPageProps) {
  return <AppointmentDetailsTemplate appointmentId={params.id} />;
}
