/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';

import Courses from '/imports/api/courses/courses';

Meteor.publish('courses.byId', function byId(courseId) {
  new SimpleSchema({
    courseId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validate({ courseId });

  return Courses.findOne(courseId);
});

Meteor.publish('courses.all', function all() {
  return Courses.find({
    deletedAt: { $exists: false },
  });
});
