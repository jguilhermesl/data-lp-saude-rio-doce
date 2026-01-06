import { ProcedureDetailsTemplate } from '@/pageTemplates/procedure-details-template';

interface ProcedureDetailsPageProps {
  params: {
    id: string;
  };
}

export default function ProcedureDetailsPage({
  params,
}: ProcedureDetailsPageProps) {
  return <ProcedureDetailsTemplate procedureId={params.id} />;
}
