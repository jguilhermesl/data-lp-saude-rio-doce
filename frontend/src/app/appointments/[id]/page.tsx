import { AppointmentDetailsTemplate } from '@/pageTemplates/appointment-details-template';

interface AppointmentDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AppointmentDetailsPage({
  params,
}: AppointmentDetailsPageProps) {
  const { id } = await params;
  return <AppointmentDetailsTemplate appointmentId={id} />;
}
