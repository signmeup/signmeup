import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:collection2';

export const Tickets = new Mongo.Collection('tickets');

Tickets.schema = new SimpleSchema({
  queueId: { type: String, regEx: SimpleSchema.RegEx.Id },
  course: { type: String },

  owner: { type: Object },
  'owner.id': { type: String, regEx: SimpleSchema.RegEx.Id },
  'owner.name': { type: String },

  status: { type: String, allowedValues: ['open', 'done', 'cancelled'] },
  question: { type: String },

  notify: { type: Object, optional: true },
  'notify.types': { type: [String], allowedValues: ['announce', 'email', 'text'], minCount: 1 },
  'notify.email': { type: String, regEx: SimpleSchema.RegEx.Email, optional: true },
  'notify.phone': { type: String, optional: true },
  'notify.carrier': { type: String, regEx: SimpleSchema.RegEx.Domain, optional: true },
  'notify.sent': { type: [String], allowedValues: ['email', 'text'], optional: true },

  ta: { type: Object, optional: true },
  'ta.id': { type: String, regEx: SimpleSchema.RegEx.Id },
  'ta.email': { type: String, regEx: SimpleSchema.RegEx.Email },

  createdAt: { type: Number },
  doneAt: { type: Number, optional: true },
  cancelledAt: { type: Number, optional: true },
});

Tickets.attachSchema(Tickets.schema);

Tickets.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; },
});

Tickets.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
