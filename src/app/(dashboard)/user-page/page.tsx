import { findUser } from 'db/queries/User';
import { findResearchGroup } from 'db/queries/ResearchGroup';
import UserPage from 'views/user/user-page';

export default async function Page() {

  const users = await findUser();
  const researchGroups = await findResearchGroup();

  return (
    <UserPage
      initialUsers={users}
      initialResearchGroups={researchGroups}
    />
  );
}