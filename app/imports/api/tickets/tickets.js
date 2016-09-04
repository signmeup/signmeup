import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

const Tickets = new Mongo.Collection('tickets');

Tickets.schema = new SimpleSchema({
  courseId: { type: String, regEx: SimpleSchema.RegEx.Id },
  queueId: { type: String, regEx: SimpleSchema.RegEx.Id },
  status: {
    type: String,
    allowedValues: ['open', 'claimed', 'markedAsDone', 'deleted'],
    defaultValue: 'open',
  },

  studentIds: { type: [String], regEx: SimpleSchema.RegEx.Id, defaultValue: [] },
  question: { type: String, optional: true },

  notifications: { type: Object, defaultValue: {} },
  'notifications.announce': { type: Boolean, optional: true },
  'notifications.email': { type: Boolean, optional: true },
  'notifications.phone': { type: Object, optional: true },
  'notifications.phone.number': { type: String },
  'notifications.phone.carrier': { type: String, regEx: SimpleSchema.RegEx.Domain },

  createdAt: { type: Date },
  createdBy: { type: String, regEx: SimpleSchema.RegEx.Id },

  claimedAt: { type: Date, optional: true },
  claimedBy: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },

  markedAsDoneAt: { type: Date, optional: true },
  markedAsDoneBy: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },

  deletedAt: { type: Date, optional: true },
  deletedBy: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
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

export default Tickets;
