import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

import Courses from '/imports/api/courses/courses.js';

Meteor.users.helpers({
  fullName() {
    if (!this.emailAddress()) return null;
    let name = this.emailAddress().split('@')[0];

    if (this.profile) {
      name = this.profile.displayName || this.profile.name || name;
    }

    return name;
  },

  firstName() {
    if (this.profile && this.profile.givenName) {
      return this.profile.givenName;
    }

    return this.fullName().split(' ')[0];
  },

  emailAddress() {
    if (this.email) {
      return this.email;
    } else if (this.emails) {
      return this.emails[0].address;
    } else if (this.profile.email) {
      return this.profile.email;
    }

    return null;
  },

  courses() {
    if (Roles.userIsInRole(this._id, ['admin', 'mta'])) {
      return Courses.find();
    }

    const htaCourseIds = Roles.getGroupsForUser(this._id, 'hta');
    const taCourseIds = Roles.getGroupsForUser(this._id, 'ta');
    return Courses.find({ _id: { $in: htaCourseIds.concat(taCourseIds) } });
  },

  activeCourses() {
    return this.courses().find({ active: true });
  },
});
