import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';

import Courses from '/imports/api/courses/courses';

export function _getUser(userId) {
  if (typeof userId === 'string') {
    return Meteor.users.findOne({ _id: userId });
  }

  return Meteor.user();
}

export function _getUserFromEmail(email) {
  return Meteor.users.findOne({
    $or: [
      { email },
      { 'emails.address': email },
    ],
  });
}

export function _getUserEmail(userId) {
  const user = _getUser(userId);

  if (user) {
    if (user.email) {
      return user.email;
    } else if (user.emails) {
      return user.emails[0].address;
    } else if (user.profile.email) {
      return user.profile.email;
    }
  }

  return null;
}

export function _getUserName(userId) {
  const user = _getUser(userId);

  if (user) {
    const emailName = _getUserEmail(userId).split('@')[0];

    if (user.profile) {
      const p = user.profile;
      return p.displayName || p.name || emailName;
    }

    return emailName;
  }

  return null;
}

export function _getUserShortName(userId) {
  const user = _getUser(userId);

  if (user && user.profile && user.profile.givenName) {
    return user.profile.givenName;
  }

  return _getUserName(userId);
}

export function _getUserCourseNames(userId) {
  const user = _getUser(userId);

  if (user) {
    if (user.admin) {
      return _.map(Courses.find({}).fetch(), (c) => {
        return c.name;
      });
    }

    let courses = [];
    if (user.htaCourses) courses = _.union(courses, user.htaCourses);
    if (user.taCourses) courses = _.union(courses, user.taCourses);

    return courses;
  }

  return null;
}

export function _getActiveUserCourseNames(userId) {
  const userCourses = _getUserCourseNames(userId);
  if (!userCourses) return null;

  return _.filter(userCourses, (c) => {
    return Courses.findOne({ name: c }).active;
  });
}

export function _getUserCourses(userId) {
  const userCourses = _getUserCourseNames(userId);
  if (!userCourses) return null;

  return Courses.find({ name: { $in: userCourses } });
}

export function _getActiveUserCourses(userId) {
  const userCourses = _getActiveUserCourseNames(userId);
  if (!userCourses) return null;

  return Courses.find({ name: { $in: userCourses } });
}

Template.registerHelper('getUser', _getUser);
Template.registerHelper('userFromEmail', _getUserFromEmail);
Template.registerHelper('userName', _getUserName);
Template.registerHelper('userShortName', _getUserShortName);
Template.registerHelper('userEmail', _getUserEmail);
Template.registerHelper('userCourseNames', _getUserCourseNames);
Template.registerHelper('activeUserCourseNames', _getActiveUserCourseNames);
Template.registerHelper('userCourses', _getUserCourses);
Template.registerHelper('activeUserCourses', _getActiveUserCourses);
