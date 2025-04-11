import { notFound } from 'next/navigation';
import { findLocationByQrID } from 'db/queries/Location';
import { findChemicalsByLocation } from 'db/queries/Chemical';
import ChemicalsTable from 'views/location/chemicals-table';

export default async function ChemicalsByLocationPage({
  params,
}: {
  params: { qrID: string };
}) {
  const { qrID } = params;
  // First, get the location using the provided qrID
  const location = await findLocationByQrID(qrID);
  if (!location) {
    return notFound();
  }
  // Now fetch chemicals under this location
  const chemicals = await findChemicalsByLocation(location.locationID);

  return (
      <ChemicalsTable chemicals={chemicals} />
  );
}