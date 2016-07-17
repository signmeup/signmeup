// Authorization Functions and Helpers

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { _getUser } from '/imports/lib/both/users';

export const authorized = {
  student(userId) {
    const user = _getUser(userId);
    return !!(user);
  },

  ta(userId, course) {
    // Always pass userId, won't work otherwise
    if (authorized.admin(userId) ||
      authorized.hta(userId, course)) {
      return true;
    }

    const user = _getUser(userId);
    if (!user) return false;
    if (!user.taCourses) return false;

    if (!course) {
      // TODO: This breaks lots of UIs if user is
      // TA for an inactive course.
      return user.taCourses.length > 0;
    }

    return (user.taCourses.indexOf(course) !== -1);
  },

  hta(userId, course) {
    // Always pass userId, won't work otherwise
    if (authorized.admin(userId)) return true;

    const user = _getUser(userId);
    if (!user) return false;
    if (!user.htaCourses) return false;

    if (!course) {
      // TODO: This breaks lots of UIs if user is
      // TA for an inactive course.
      return user.htaCourses.length > 0;
    }

    return (user.htaCourses.indexOf(course) !== -1);
  },

  admin(userId) {
    const user = _getUser(userId);
    if (!user) return false;

    return user.admin;
  },
};

if (Meteor.isClient) {
  Template.registerHelper('userIs', (role, course = null) => {
    return authorized[role](Meteor.userId(), course);
  });
}
