/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';

import Locations from '/imports/api/locations/locations';

Meteor.publish('locations.all', function all() {
  return Locations.find({});
});
