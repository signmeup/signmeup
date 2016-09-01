import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Locations = new Mongo.Collection('locations');

Locations.schema = new SimpleSchema({
  name: { type: String },
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

export default Locations;
