import { Migrations } from 'meteor/percolate:migrations';

import { Locations } from '/imports/api/locations/locations';
import { Queues } from '/imports/api/queues/queues';

Migrations.add({
  version: 3,

  up() {
    const fishbowlWithLocation = Locations.findOne({ name: 'CIT 271 (Fishbowl)' });
    const fishbowl = Locations.findOne({ name: 'Fishbowl' });

    const moonlabWithLocation = Locations.findOne({ name: 'CIT 227 (Moonlab)' });
    const moonlab = Locations.findOne({ name: 'Moonlab' });

    if (fishbowlWithLocation && fishbowl) {
      Queues.update({
        locationId: fishbowl._id,
      }, {
        $set: {
          locationId: fishbowlWithLocation._id,
        },
      });

      Locations.remove(fishbowl._id);
    }

    if (moonlabWithLocation && moonlab) {
      Queues.update({
        locationId: moonlab._id,
      }, {
        $set: {
          locationId: moonlabWithLocation._id,
        },
      });

      Locations.remove(moonlab._id);
    }
  },

  down() {
    // Cannot really migrate backwards since we cannot keep track of queues that
    // pointed to the old location. Skipping.
  },
});
