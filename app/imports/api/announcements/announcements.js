import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Announcements = new Mongo.Collection('announcements');

Announcements.schema = new SimpleSchema({
  owner: { type: Object },
  'owner.id': { type: String, regEx: SimpleSchema.RegEx.Id },
  'owner.email': { type: String, regEx: SimpleSchema.RegEx.Email },

  type: { type: String, allowedValues: ['info', 'success', 'warning', 'danger'] },
  header: { type: String, optional: true },
  content: { type: String },

  createdAt: { type: Date },
});

Announcements.attachSchema(Announcements.schema);

Announcements.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; },
});

Announcements.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});

export default Announcements;
