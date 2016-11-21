/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';

import { Locations } from '/imports/api/locations/locations';

Meteor.publish('locations.byId', function byId(locationId) {
  return Locations.find({ _id: locationId });
});

Meteor.publish('locations.active', function active() {
  return Locations.find({
    deletedAt: { $exists: false },
  });
});
