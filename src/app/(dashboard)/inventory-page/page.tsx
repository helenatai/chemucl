import InventoryPage from 'views/inventory/inventory-page';
import { findChemical } from 'db/queries/Chemical';
import { findLocation } from 'db/queries/Location';
import { findResearchGroup } from 'db/queries/ResearchGroup';

export default async function Page() {
  const chemicals = await findChemical();
  const locations = await findLocation();
  const researchGroups = await findResearchGroup();

  return <InventoryPage initialChemicals={chemicals} initialLocations={locations} initialResearchGroups={researchGroups} />;
}
