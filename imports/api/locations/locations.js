import { Mongo } from 'meteor/mongo';

import SimpleSchema from 'simpl-schema';

export const Locations = new Mongo.Collection('locations');

Locations.schema = new SimpleSchema({
  name: { type: String },

  deletedAt: { type: Date, optional: true },
  deletedBy: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
});

Locations.attachSchema(Locations.schema);

Locations.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; },
});

Locations.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
