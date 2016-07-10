import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:collection2';

export const Locations = new Mongo.Collection('locations');

Locations.schema = new SimpleSchema({
  name: { type: String },
});

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
