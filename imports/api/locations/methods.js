import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import { Locations } from '/imports/api/locations/locations';

export const createLocation = new ValidatedMethod({
  name: 'locations.createLocation',
  validate: Locations.simpleSchema().pick([
    'name',
  ]).validator(),
  run({ name }) {
    if (this.connection) {
      const user = Meteor.users.findOne(this.userId);
      if (!user.isTAOrAbove()) {
        throw new Meteor.Error('locations.createLocation.unauthorized',
        'Only TAs and above can create locations.');
      }
    }

    const location = Locations.findOne({
      name: name,
      deletedAt: { $exists: false },
    });

    if (location) {
      throw new Meteor.Error('locations.createLocation.alreadyExists',
        'A location with that name already exists.');
    }

    return Locations.insert({ name });
  },
});

export const updateLocation = new ValidatedMethod({
  name: 'locations.updateLocation',
  validate: new SimpleSchema({
    locationId: { type: String, regEx: SimpleSchema.RegEx.Id },
    name: { type: String },
  }).validator(),
  run({ locationId, name }) {
    const location = Locations.findOne(locationId);
    if (!location) {
      throw new Meteor.Error('locations.doesNotExist',
        `No location exists with id ${locationId}`);
    }

    const user = Meteor.users.findOne(this.userId);
    if (!user.isTAOrAbove()) {
      throw new Meteor.Error('locations.updateLocation.unauthorized',
      'Only TAs and above can update locations.');
    }

    Locations.update({
      _id: locationId,
    }, {
      $set: {
        name: name,
      },
    });
  },
});

export const deleteLocation = new ValidatedMethod({
  name: 'locations.deleteLocation',
  validate: new SimpleSchema({
    locationId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ locationId }) {
    const location = Locations.findOne(locationId);
    if (!location) {
      throw new Meteor.Error('locations.doesNotExist',
        `No location exists with id ${locationId}`);
    }

    const user = Meteor.users.findOne(this.userId);
    if (!user.isTAOrAbove()) {
      throw new Meteor.Error('locations.deleteLocation.unauthorized',
      'Only TAs and above can delete locations.');
    }

    Locations.update({
      _id: locationId,
    }, {
      $set: {
        deletedAt: new Date(),
        deletedBy: this.userId,
      },
    });
  },
});
