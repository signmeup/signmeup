import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';

import SimpleSchema from 'simpl-schema';

import { Courses, SettingsSchema } from '/imports/api/courses/courses.js';

export const createCourse = new ValidatedMethod({
  name: 'courses.createCourse',
  validate: Courses.simpleSchema().pick([
    'name', 'description',
  ]).validator(),
  run({ name, description }) {
    if (this.connection && !Roles.userIsInRole(this.userId, ['admin', 'mta'])) {
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

export const updateCourse = new ValidatedMethod({
  name: 'courses.updateCourse',
  validate: new SimpleSchema({
    courseId: { type: String, regEx: SimpleSchema.RegEx.Id },
    name: { type: String },
    description: { type: String },
  }).validator(),
  run({ courseId, name, description }) {
    const course = Courses.findOne(courseId);
    if (!course) {
      throw new Meteor.Error('courses.doesNotExist',
        `No course exists with id ${courseId}`);
    }

    if (!Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta'], courseId)) {
      throw new Meteor.Error('courses.unauthorized',
        'Only HTAs and above can update courses.');
    }

    Courses.update({
      _id: courseId,
    }, {
      $set: {
        name: name, // eslint-disable-line object-shorthand
        description: description, // eslint-disable-line object-shorthand
      },
    });
  },
});

export const updateSettings = new ValidatedMethod({
  name: 'courses.updateSettings',
  validate: new SimpleSchema({
    courseId: { type: String, regEx: SimpleSchema.RegEx.Id },
    settings: { type: SettingsSchema },
  }).validator(),
  run({ courseId, settings }) {
    const course = Courses.findOne(courseId);
    if (!course) {
      throw new Meteor.Error('courses.doesNotExist',
        `No course exists with id ${courseId}`);
    }

    if (!Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta'], courseId)) {
      throw new Meteor.Error('courses.unauthorized',
        'Only HTAs and above can update courses.');
    }

    Courses.update({
      _id: courseId,
    }, {
      $set: {
        settings: settings, // eslint-disable-line object-shorthand
      },
    });
  },
});
