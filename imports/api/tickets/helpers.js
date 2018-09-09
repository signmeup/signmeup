import { Meteor } from "meteor/meteor";
import { _ } from "meteor/underscore";

import { Courses } from "/imports/api/courses/courses";
import { Queues } from "/imports/api/queues/queues";
import { Tickets } from "/imports/api/tickets/tickets";

Tickets.helpers({
  course() {
    return Courses.find({
      _id: this.courseId
    });
  },

  queue() {
    return Queues.find({
      _id: this.queueId
    });
  },

  isOpen() {
    return this.status === "open";
  },

  isClaimed() {
    return this.status === "claimed";
  },

  isMarkedAsMissing() {
    return this.status === "markedAsMissing";
  },

  isMarkedAsDone() {
    return this.status === "markedAsDone";
  },

  isDeleted() {
    return this.status === "deleted";
  },

  isActive() {
    return this.isOpen() || this.isClaimed() || this.isMarkedAsMissing();
  },

  students() {
    return Meteor.users.find({
      _id: { $in: this.studentIds }
    });
  },

  belongsToUser(userId) {
    return _.contains(this.studentIds, userId);
  },

  claimedByUser() {
    return Meteor.users.findOne(this.claimedBy);
  },

  isClaimedByUser(userId) {
    return this.status === "claimed" && userId === this.claimedBy;
  }
});
