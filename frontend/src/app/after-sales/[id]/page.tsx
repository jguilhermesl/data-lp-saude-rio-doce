import { DispatchDetailsTemplate } from '@/pageTemplates/dispatch-details-template';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DispatchDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <DispatchDetailsTemplate dispatchId={id} />;
}
