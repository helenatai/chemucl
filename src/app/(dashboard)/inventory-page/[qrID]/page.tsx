import { notFound } from 'next/navigation';
import ChemicalInformation from 'views/inventory/chemical-information';
import { findChemicalByQrID } from 'db/queries/Chemical';
import { findLocation } from 'db/queries/Location';
import { findResearchGroup } from 'db/queries/ResearchGroup';

export default async function ChemicalInformationPage({ params }: { params: { qrID: string } }) {
  const { qrID } = params;
  const chemical = await findChemicalByQrID(qrID);
  const locations = await findLocation();
  const researchGroups = await findResearchGroup();

  if (!chemical) {
    return notFound();
  }

  return <ChemicalInformation chemical={chemical} locations={locations} researchGroups={researchGroups} />;
}
