import { notFound } from 'next/navigation';
import LocationTabs from 'views/location/location-tabs';
import { findLocationByQrID } from 'db/queries/Location';

export default async function LocationPage({ params }: { params: { qrID: string } }) {
  const { qrID } = params;

  const location = await findLocationByQrID(qrID);

  if (!location) {
    return notFound();
  }

  return <LocationTabs location={location} />;
}
