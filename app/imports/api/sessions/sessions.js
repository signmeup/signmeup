import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Sessions = new Mongo.Collection('sessions');

Sessions.schema = new SimpleSchema({
  secret: { type: String, regEx: SimpleSchema.RegEx.Id },
  userId: { type: String, regEx: SimpleSchema.RegEx.Id },
  userAgent: { type: String },
});

Sessions.attachSchema(Sessions.schema);

Sessions.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; },
});

Sessions.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

export default Sessions;
