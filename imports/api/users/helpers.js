import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';

import { Courses } from '/imports/api/courses/courses';

const getPropHelper = (obj, prop) => {
  if (prop.length === 0) return obj;
  if (!obj) return undefined;
  const elt = prop.shift();
  return getPropHelper(obj[elt], prop);
};

// safely get the given deep property, specified in dot notation
const getProp = (obj, prop) => {
  return getPropHelper(obj, prop.split('.'));
};

// return the first existing property, or undefined if none exist
const getFirstProp = (obj, ...props) => {
  return _.find(_.map(props, (prop) => {
    return getProp(obj, prop);
  }), _.identity);
};

Meteor.users.helpers({
  fullName() {
    const email = this.emailAddress();
    const name = getFirstProp(this, 'name', 'services.google.name') ||
      (email && email.split('@')[0]);

    return name;
  },

  firstName() {
    const name = getProp(this, 'services.google.given_name');
    const fullName = this.fullName();
    return name || (fullName && fullName.split(' ')[0]);
  },

  initials() {
    let initials = '';
    let fullName = this.fullName();

    let parts = fullName.split(' ');
    if (parts.length < 2) parts = fullName.split('_');

    if (parts.length >= 2) {
      initials = parts[0][0] + parts[parts.length - 1][0];
    } else {
      initials = parts[0].substring(0, 2);
    }

    return initials.toUpperCase();
  },

  emailAddress() {
    const email = getProp(this, 'services.google.email');

    if (email) {
      return email;
    } else if (this.emails) {
      return this.emails[0].address;
    }

    return null;
  },

  htaCourses() {
    const htaCourseIds = Roles.getGroupsForUser(this._id, 'hta');
    return Courses.find({ _id: { $in: htaCourseIds }, active: true });
  },

  courses() {
    if (Roles.userIsInRole(this._id, ['admin', 'mta'])) {
      return Courses.find({ active: true }, { sort: { name: 1 } });
    }

    const htaCourseIds = Roles.getGroupsForUser(this._id, 'hta');
    const taCourseIds = Roles.getGroupsForUser(this._id, 'ta');
    return Courses.find(
      { _id: { $in: htaCourseIds.concat(taCourseIds) }, active: true },
      { sort: { name: 1 } },
    );
  },

  isTAOrAbove() {
    return this.courses().count() > 0;
  },
});
