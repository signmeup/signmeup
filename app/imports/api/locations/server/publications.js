// Locations Publications

import { Meteor } from 'meteor/meteor';

import Locations from '/imports/api/locations/locations';

Meteor.publish('locations', () => {
  return Locations.find({});
});
