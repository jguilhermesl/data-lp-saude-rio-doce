import { PatientDetailsTemplate } from '@/pageTemplates/patient-details-template';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  return <PatientDetailsTemplate patientId={id} />;
};

export default Page;
