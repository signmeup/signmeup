import { Mongo } from 'meteor/mongo';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

export const Courses = new Mongo.Collection('courses');

Courses.schema = new SimpleSchema({
  name: { type: String },
  description: { type: String, optional: true },
  active: { type: Boolean },

  settings: { type: Object, defaultValue: {} },
  'settings.signupGap': { type: Number, defaultValue: 0 },

  createdAt: { type: Date },
  deletedAt: { type: Date, optional: true },
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
