import { ProcedureDetailsTemplate } from '@/pageTemplates/procedure-details-template';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  return <ProcedureDetailsTemplate procedureId={id} />;
};

export default Page;
