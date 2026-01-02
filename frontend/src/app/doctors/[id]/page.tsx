import { DoctorDetailsTemplate } from '@/pageTemplates/doctor-details-template';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  return <DoctorDetailsTemplate doctorId={id} />;
};

export default Page;
