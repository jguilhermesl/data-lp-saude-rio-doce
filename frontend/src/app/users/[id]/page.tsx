import { UserDetailsTemplate } from '@/pageTemplates/user-details-template';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;
  return <UserDetailsTemplate userId={id} />;
};

export default Page;
