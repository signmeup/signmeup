import { Roles } from "meteor/alanning:roles";

import { Courses } from "/imports/api/courses/courses";

Courses.helpers({
  staff() {
    return Roles.getUsersInRole(["hta", "ta"], this._id);
  },

  htas() {
    return Roles.getUsersInRole("hta", this._id);
  },

  tas() {
    return Roles.getUsersInRole("ta", this._id);
  }
});
