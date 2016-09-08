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

  students() {
    return Meteor.users.find({
      _id: { $in: this.studentIds },
    });
  },

  belongsToUser(userId) {
    return _.contains(this.studentIds, userId);
  },
});
