import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import { Courses } from '/imports/api/courses/courses.js';
import { Queues } from '/imports/api/queues/queues.js';
import { Tickets } from '/imports/api/tickets/tickets.js';

Tickets.helpers({
  course() {
    return Courses.find({
      _id: this.courseId,
    });
  },

  queue() {
    return Queues.find({
      _id: this.queueId,
    });
  },

  isOpen() {
    return this.status === 'open';
  },

  isClaimed() {
    return this.status === 'claimed';
  },

  isMarkedAsMissing() {
    return this.status === 'markedAsMissing';
  },

  isMarkedAsDone() {
    return this.status === 'markedAsDone';
  },

  isDeleted() {
    return this.status === 'deleted';
  },

  students() {
    return Meteor.users.find({
      _id: { $in: this.studentIds },
    });
  },

  belongsToUser(userId) {
    return _.contains(this.studentIds, userId);
  },

  claimedByUser(userId) {
    return this.claimedBy && userId === this.claimedBy;
  },
});
