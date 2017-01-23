import { Mongo } from 'meteor/mongo';

import SimpleSchema from 'simpl-schema';

export const Announcements = new Mongo.Collection('announcements');

Announcements.schema = new SimpleSchema({
  type: {
    type: String,
    allowedValues: ['info', 'success', 'warning', 'danger'],
    defaultValue: 'info',
  },

  header: { type: String, optional: true },
  content: { type: String },

  createdAt: { type: Date },
  createdBy: { type: String, regEx: SimpleSchema.RegEx.Id },
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
