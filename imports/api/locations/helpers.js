import { Locations } from '/imports/api/locations/locations';

// Static helpers

export function locations() {
  return Locations.find();
}
