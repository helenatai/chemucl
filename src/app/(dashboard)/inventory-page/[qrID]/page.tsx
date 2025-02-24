import { db } from 'db'; 
import ChemicalInformation from 'views/inventory-page/chemical-information';
import { notFound } from 'next/navigation';

export default async function ChemicalInformationPage({ params }: { params: { qrID: string } }) {
  const chemical = await db.chemical.findFirst({
    where: { qrID: params.qrID },
    include: {
      location: true,
      researchGroup: true,
    },
  });

  if (!chemical) {
    return notFound();
  }

  return <ChemicalInformation chemical={chemical} />;
}
