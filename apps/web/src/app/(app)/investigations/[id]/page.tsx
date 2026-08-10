import { InvestigationWorkspace } from '@/features/investigation/InvestigationWorkspace';

export default async function InvestigationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <InvestigationWorkspace id={id} />;
}