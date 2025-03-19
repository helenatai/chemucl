import { notFound } from 'next/navigation';
import ChemicalInformation from 'views/inventory/chemical-information';
import { findChemicalByQrID } from 'db/queries/Chemical';

export default async function ChemicalInformationPage({ params }: { params: { qrID: string } }) {
  const { qrID } = params;

  const chemical = await findChemicalByQrID(qrID);
  
  if (!chemical) {
    return notFound();
  }

  return <ChemicalInformation chemical={chemical} />;
}
