import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:collection2';

export const Courses = new Mongo.Collection('courses');

Courses.schema = new SimpleSchema({
  name: { type: String },
  description: { type: String, optional: true },
  listserv: { type: String, regEx: SimpleSchema.RegEx.Email, optional: true },
  active: { type: Boolean },

  htas: { type: [String], regEx: SimpleSchema.RegEx.Id, optional: true },
  tas: { type: [String], regEx: SimpleSchema.RegEx.Id, optional: true },

  settings: { type: Object, optional: true },
  'settings.signupGap': { type: Number, defaultValue: 0, optional: true },

  createdAt: { type: Number },
});

Courses.attachSchema(Courses.schema);

Courses.allow({
  insert() { return false; },
  update() { return false; },
  remove() { return false; },
});

Courses.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});
