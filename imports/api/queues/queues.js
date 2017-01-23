import { Mongo } from 'meteor/mongo';

import SimpleSchema from 'simpl-schema';

export const Queues = new Mongo.Collection('queues');

Queues.schema = new SimpleSchema({
  name: { type: String },
  courseId: { type: String, regEx: SimpleSchema.RegEx.Id },
  locationId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  status: { type: String, allowedValues: ['open', 'cutoff', 'ended'], defaultValue: 'open' },

  announcementIds: { type: Array, defaultValue: [] },
  'announcementIds.$': { type: String, regEx: SimpleSchema.RegEx.Id },

  ticketIds: { type: Array, defaultValue: [] },
  'ticketIds.$': { type: String, regEx: SimpleSchema.RegEx.Id },

  settings: { type: Object, defaultValue: {} },
  'settings.restrictedSessionIds': { type: Array, defaultValue: [] },
  'settings.restrictedSessionIds.$': { type: String, regEx: SimpleSchema.RegEx.Id },

  scheduledEndTime: { type: Date },

  createdAt: { type: Date },
  createdBy: { type: String, regEx: SimpleSchema.RegEx.Id },

  cutoffAt: { type: Date, optional: true },
  cutoffAfter: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  cutoffBy: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },

  endedAt: { type: Date, optional: true },
  endedBy: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
});

Queues.attachSchema(Queues.schema);

Queues.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; },
});

Queues.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
