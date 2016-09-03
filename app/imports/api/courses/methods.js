import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Roles } from 'meteor/alanning:roles';

import Courses from '/imports/api/courses/courses.js';

export const createCourse = new ValidatedMethod({
  name: 'courses.createCourse',
  validate: new SimpleSchema({
    name: { type: String },
    description: { type: String },
  }).validator(),
  run({ name, description }) {
    if (!!this.connection && !Roles.userIsInRole(this.userId, ['admin', 'mta'])) {
      throw new Meteor.Error('courses.createCourse.unauthorized',
        'Only admins and MTAs can create courses.');
    }

    const courseId = Courses.insert({
      name,
      description,
      active: true,

      createdAt: new Date(),
    });

    return courseId;
  },
});
