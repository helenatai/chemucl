import LocationPage from 'views/location/location-page';
import { findLocation } from 'db/queries/Location';

export default async function Page() {
  const locations = await findLocation();
  return <LocationPage initialLocations={locations} />;
}
