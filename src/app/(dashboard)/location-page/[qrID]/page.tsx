import { notFound } from 'next/navigation';
import LocationInformation from 'views/location/location-information';
import { findLocationByQrID } from 'db/queries/Location';

export default async function LocationInformationPage({ params }: { params: { qrID: string } }) {
  const { qrID } = params;

  const location = await findLocationByQrID(qrID);

  if (!location) {
    return notFound();
  }

  return <LocationInformation location={location} />;
}
