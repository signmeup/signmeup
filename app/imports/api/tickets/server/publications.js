// Tickets Publications

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';

import Courses from '/imports/api/courses/courses';
import Queues from '/imports/api/queues/queues';
import Tickets from '/imports/api/tickets/tickets';

import { authorized } from '/imports/lib/both/auth';

Meteor.smartPublish('allActiveTickets', () => {
  // Note the smartPublish: we use this to return multiple
  // cursors of the same collection.
  const activeQueues = Queues.find({ status: { $nin: ['ended', 'cancelled'] } }).fetch();
  const activeTickets = [];

  _.each(activeQueues, (queue) => {
    const queueId = queue._id;
    let isTA = false;
    if (this.userId) {
      isTA = authorized.ta(this.userId, queue.course);
    }

    const tickets = Tickets.find({
      queueId,
      status: 'open',
    }, {
      fields: {
        question: isTA,
        notify: isTA,
        ta: isTA,
      },
    });

    activeTickets.push(tickets);
  });

  return activeTickets;
});

Meteor.publish('allQueueTickets', (queueId) => {
  check(queueId, String);

  const queue = Queues.findOne({ _id: queueId });
  if (!queue) {
    throw new Meteor.Error('invalid-queue-id');
  }

  // Hide fields for non-TAs
  let projection = {
    fields: {
      'notify.email': false,
      'notify.phone': false,
      'notify.carrier': false,
    },
  };

  let isTA = false;
  if (this.userId) {
    isTA = authorized.ta(this.userId, queue.course);
  }

  if (!isTA) {
    projection = {
      question: false,
      notify: false,
      ta: false,
    };
  }

  return Tickets.find({
    queueId,
  }, projection);
});

Meteor.publish('allTicketsInRange', (course, startTime = 0, endTime = Date.now()) => {
  check(course, String);
  check(startTime, Number);
  check(endTime, Number);

  const courseObject = Courses.findOne({ name: course });
  if (!courseObject) {
    throw new Meteor.Error('invalid-course-name');
  }

  if (!authorized.hta(this.userId, course)) {
    throw new Meteor.Error('not-allowed');
  }

  return Tickets.find({
    course,
    createdAt: { $gte: startTime, $lte: endTime },
  }, {
    fields: {
      'notify.email': false,
      'notify.phone': false,
      'notify.carrier': false,
    },
  });
});
