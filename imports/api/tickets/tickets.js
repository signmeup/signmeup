import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const Tickets = new Mongo.Collection("tickets");

export const NotificationsSchema = new SimpleSchema({
  // Note: announce is only present for backwards compatibility.
  // New tickets should not contain this field.
  announce: { type: Boolean, optional: true },
  email: { type: String, regEx: SimpleSchema.RegEx.Email, optional: true },
  phone: { type: Object, optional: true },
  "phone.number": { type: String },
  "phone.carrier": { type: String, regEx: SimpleSchema.RegEx.Domain }
});

Tickets.schema = new SimpleSchema({
  courseId: { type: String, regEx: SimpleSchema.RegEx.Id },
  queueId: { type: String, regEx: SimpleSchema.RegEx.Id, index: true },
  status: {
    type: String,
    allowedValues: [
      "open",
      "claimed",
      "markedAsMissing",
      "markedAsDone",
      "deleted"
    ],
    defaultValue: "open",
    index: true
  },

  studentIds: {
    type: [String],
    regEx: SimpleSchema.RegEx.Id,
    defaultValue: []
  },
  question: { type: String, optional: true },

  notifications: { type: NotificationsSchema, defaultValue: {} },

  createdAt: { type: Date },
  createdBy: { type: String, regEx: SimpleSchema.RegEx.Id },

  claimedAt: { type: Date, optional: true },
  claimedBy: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },

  markedAsMissingAt: { type: Date, optional: true },
  markedAsMissingBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },

  markedAsDoneAt: { type: Date, optional: true },
  markedAsDoneBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true
  },

  deletedAt: { type: Date, optional: true },
  deletedBy: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true }
});

Tickets.attachSchema(Tickets.schema);

Tickets.publicFields = {
  courseId: true,
  queueId: true,
  status: true,

  studentIds: true,

  createdAt: true,
  claimedAt: true,
  claimedBy: true,
  markedAsDoneAt: true,
  deletedAt: true
};

Tickets.allow({
  insert() {
    return false;
  },
  update() {
    return false;
  },
  remove() {
    return false;
  }
});

Tickets.deny({
  insert() {
    return true;
  },
  update() {
    return true;
  },
  remove() {
    return true;
  }
});
