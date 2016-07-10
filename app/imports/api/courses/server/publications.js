// Courses Publications

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Courses from '/imports/api/courses/courses';

Meteor.publish('courses', () => {
  return Courses.find({});
});

Meteor.publish('course', (name) => {
  check(name, String);
  return Courses.find({ name });
});
