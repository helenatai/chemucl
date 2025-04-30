import { notFound } from 'next/navigation';
import ResearchGroupInformation from 'views/user/research-group-information';
import { findResearchGroupById } from 'db/queries/ResearchGroup';
import { findUsersByResearchGroup } from 'db/queries/User';

interface ResearchGroupPageProps {
  params: {
    groupId: string;
  };
}

export default async function ResearchGroupPage({ params }: ResearchGroupPageProps) {
  const researchGroup = await findResearchGroupById(parseInt(params.groupId));
  const users = await findUsersByResearchGroup(parseInt(params.groupId));

  if (!researchGroup) {
    notFound();
  }

  return <ResearchGroupInformation researchGroup={researchGroup} users={users} />;
}
