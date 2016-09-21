import { Roles } from 'meteor/alanning:roles';

import { Courses } from '/imports/api/courses/courses.js';

Courses.helpers({
  htas() {
    return Roles.getUsersInRole('hta', this._id);
  },

  tas() {
    return Roles.getUsersInRole('ta', this._id);
  },
});
