// Courses Methods

// TODO: Replace input error checks with check()
// TODO: Replace 'not-allowed' errors with 403 errors

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';

import { Courses } from '/imports/api/courses/courses';

import { authorized } from '/imports/lib/both/auth';
import { _getUserFromEmail } from '/imports/lib/both/users';

Meteor.methods({
  // createCourse(name, description, listserv) {
  //   check(name, String);
  //   check(description, String);
  //   check(listserv, String);
  //
  //   if (!authorized.admin(Meteor.userId)) {
  //     throw new Meteor.Error('not-allowed');
  //   }
  //
  //   if (Courses.findOne({ name })) {
  //     throw new Meteor.Error('course-exists');
  //   }
  //
  //   Courses.insert({
  //     name,
  //     description,
  //     listserv,
  //     active: false,
  //     createdAt: Date.now(),
  //   });
  // },

  updateCourse(course, options) {
    check(course, String);
    check(options, Object);

    // Update name, description, listserv, or active
    if (!authorized.hta(Meteor.userId, course)) {
      throw new Meteor.Error('not-allowed');
    }

    const validFields = ['name', 'description', 'listserv', 'active'];
    const validOptions = _.pick(options, validFields);

    console.log(`Updating ${course} with ${JSON.stringify(validOptions)}`);
    Courses.update({ name: course }, {
      $set: validOptions,
    });
  },

  addTA(course, email) {
    check(course, String);
    check(email, String);

    if (!authorized.hta(Meteor.userId, course)) {
      throw new Meteor.Error('not-allowed');
    }

    let userId;
    const user = _getUserFromEmail(email);
    if (user) {
      // Find the TA
      userId = user._id;
    } else {
      // Or, create a new user for the TA
      userId = Meteor.users.insert({
        email,
      });
    }

    if (authorized.ta(userId, course)) {
      throw new Meteor.Error('already-a-ta');
    }

    // Update the course
    Courses.update({ name: course }, {
      $push: { tas: userId },
    });

    // Update the user
    Meteor.users.update(userId, {
      $push: { taCourses: course },
    });
  },

  deleteTA(course, userId) {
    check(course, String);
    check(userId, String);

    if (!authorized.hta(Meteor.userId, course)) {
      throw new Meteor.Error('not-allowed');
    }

    Courses.update({ name: course }, {
      $pull: { tas: userId, htas: userId },
    });

    Meteor.users.update(userId, {
      $pull: { taCourses: course, htaCourses: course },
    });
  },

  switchToTA(course, userId) {
    check(course, String);
    check(userId, String);

    if (!authorized.hta(Meteor.userId, course)) {
      throw new Meteor.Error('not-allowed');
    }

    Courses.update({ name: course }, {
      $pull: { htas: userId },
      $push: { tas: userId },
    });

    Meteor.users.update(userId, {
      $pull: { htaCourses: course },
      $push: { taCourses: course },
    });
  },

  switchToHTA(course, userId) {
    check(course, String);
    check(userId, String);

    if (!authorized.hta(Meteor.userId, course)) {
      throw new Meteor.Error('not-allowed');
    }

    Courses.update({ name: course }, {
      $pull: { tas: userId },
      $push: { htas: userId },
    });

    Meteor.users.update(userId, {
      $pull: { taCourses: course },
      $push: { htaCourses: course },
    });
  },

  updateCourseSettings(courseName, settings) {
    check(courseName, String);
    check(settings, Object);

    // Update signupGap and other (future) settings
    if (!authorized.hta(Meteor.userId, courseName)) {
      throw new Meteor.Error('not-allowed');
    }

    const validFields = ['signupGap'];
    const validSettings = _.pick(settings, validFields);

    const course = Courses.findOne({ name: courseName });
    const currentSettings = course.settings || {};
    const newSettings = _.extend(currentSettings, validSettings);

    console.log(`Updating ${courseName} settings with ${JSON.stringify(validSettings)}`);
    Courses.update({ name: courseName }, {
      $set: { settings: newSettings },
    });
  },

  deleteCourse(courseName) {
    check(courseName, String);

    if (!authorized.hta(Meteor.userId, courseName)) {
      throw new Meteor.Error('not-allowed');
    }

    const course = Courses.findOne({ name: courseName });
    if (!course) {
      throw new Meteor.Error('invalid-course-name');
    }

    const htas = course.htas;
    const tas = course.tas;

    _.each(htas, (hta) => {
      Meteor.users.update(hta, {
        $pull: { htaCourses: course.name },
      });
    });

    _.each(tas, (ta) => {
      Meteor.users.update(ta, {
        $pull: { taCourses: course.name },
      });
    });

    Courses.remove(course._id);
  },
});
