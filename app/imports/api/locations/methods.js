import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';

import Locations from '/imports/api/locations/locations.js';

export const createLocation = new ValidatedMethod({
  name: 'locations.createLocation',
  validate: Locations.simpleSchema().pick([
    'name',
  ]).validator(),
  run({ name }) {
    if (!!this.connection && !Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'])) {
      throw new Meteor.Error('locations.createLocation.unauthorized',
        'Only TAs and above can create locations.');
    }

    const locationId = Locations.insert({ name });

    return locationId;
  },
});
