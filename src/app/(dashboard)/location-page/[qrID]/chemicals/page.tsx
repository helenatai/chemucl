import { notFound } from 'next/navigation';
import LocationTabs from 'views/location/location-tabs';
import { findLocationByQrID } from 'db/queries/Location';
import { findChemicalsByLocation } from 'db/queries/Chemical';

export default async function LocationChemicalsPage({ params }: { params: { qrID: string } }) {
  const { qrID } = params;

  const location = await findLocationByQrID(qrID);

  if (!location) {
    return notFound();
  }

  const chemicals = await findChemicalsByLocation(location.locationID);

  return <LocationTabs location={location} chemicals={chemicals} />;
}