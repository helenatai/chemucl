import { notFound } from 'next/navigation';
import UserInformation from 'views/user/user-information';
import { findUserById } from 'db/queries/User';
import { findResearchGroup } from 'db/queries/ResearchGroup';

interface UserPageProps {
  params: {
    id: string;
  };
}

export default async function UserPage({ params }: UserPageProps) {
  const user = await findUserById(params.id);
  const researchGroups = await findResearchGroup();

  if (!user) {
    notFound();
  }

  return (
    <UserInformation user={user} researchGroups={researchGroups} />
  );
} 