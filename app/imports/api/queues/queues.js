import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:collection2';

export const Queues = new Mongo.Collection('queues');

Queues.schema = new SimpleSchema({
  name: { type: String },
  course: { type: String },
  location: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  status: { type: String, allowedValues: ['active', 'cutoff', 'ended'] },

  owner: { type: Object },
  'owner.id': { type: String, regEx: SimpleSchema.RegEx.Id },
  'owner.email': { type: String, regEx: SimpleSchema.RegEx.Email },

  announcements: { type: [String], regEx: SimpleSchema.RegEx.Id, optional: true },
  tickets: { type: [String], regEx: SimpleSchema.RegEx.Id, defaultValue: [] },

  startTime: { type: Number },
  cutoffTime: { type: Number, optional: true },
  endTime: { type: Number, optional: true },
  averageWaitTime: { type: Number, defaultValue: 0 },
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
