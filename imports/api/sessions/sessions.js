import { Mongo } from "meteor/mongo";
import { SimpleSchema } from "meteor/aldeed:simple-schema";

export const Sessions = new Mongo.Collection("sessions");

Sessions.schema = new SimpleSchema({
  name: { type: String },
  queueId: { type: String, regEx: SimpleSchema.RegEx.Id, index: true },

  userId: { type: String, regEx: SimpleSchema.RegEx.Id },
  userAgent: { type: String },

  secret: { type: String, regEx: SimpleSchema.RegEx.Id }
});

Sessions.attachSchema(Sessions.schema);

Sessions.allow({
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

Sessions.deny({
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
