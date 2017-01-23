import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';

import { Courses } from '/imports/api/courses/courses.js';

import { createUser, findUserByEmail } from '/imports/lib/both/users.js';

export const addRoleGivenEmail = new ValidatedMethod({
  name: 'users.addRoleGivenEmail',
  validate: new SimpleSchema({
    email: { type: String, regEx: SimpleSchema.RegEx.Email },
    role: { type: String, allowedValues: ['admin', 'mta', 'hta', 'ta'] },
    courseId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  }).validator(),
  run({ email, role, courseId }) {
    // If specified, check if course exists
    const course = Courses.findOne(courseId);
    if (_.contains(['hta', 'ta'], role) && !course) {
      throw new Meteor.Error('courses.doesNotExist',
        `No course with id ${courseId}`);
    }

    // Check current user is authorized to create role
    if (course && !Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta'], courseId)) {
      throw new Meteor.Error('users.addRoleGivenEmail.unauthorized',
        'Only HTAs and above can add roles to the course');
    }

    // Fetch or create new user
    email = email.toLowerCase(); // eslint-disable-line no-param-reassign
    const user = findUserByEmail(email);
    const userId = user ? user._id : createUser({ email, saml: true });

    // If adding TA or HTA role, make sure user isn't already a TA or HTA
    if (Roles.userIsInRole(userId, ['hta', 'ta'], courseId)) {
      throw new Meteor.Error('users.addRoleGivenEmail.hasConflictingRole',
        `User already has HTA or TA role for course ${courseId}`);
    }

    // Create role
    if (course) {
      Roles.addUsersToRoles(userId, role, courseId);
    } else {
      Roles.addUsersToRoles(userId, role);
    }
  },
});

export const removeRole = new ValidatedMethod({
  name: 'users.removeRole',
  validate: new SimpleSchema({
    userId: { type: String, regEx: SimpleSchema.RegEx.Id },
    role: { type: String, allowedValues: ['admin', 'mta', 'hta', 'ta'] },
    courseId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  }).validator(),
  run({ userId, role, courseId }) {
    const user = Meteor.users.findOne(userId);
    if (!user) {
      throw new Meteor.Error('users.doesNotExist',
        `No user exists with id ${userId}`);
    }

    const course = Courses.findOne(courseId);
    if (_.contains(['hta', 'ta'], role) && !course) {
      throw new Meteor.Error('courses.doesNotExist',
        `No course with id ${courseId}`);
    }

    if (course) {
      Roles.removeUsersFromRoles(userId, role, courseId);
    } else {
      Roles.removeUsersFromRoles(userId, role);
    }
  },
});
