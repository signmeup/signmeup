// Queues Publications

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import Queues from '/imports/api/queues/queues';

import { authorized } from '/imports/lib/both/auth';

Meteor.publish('queue', (queueId) => {
  check(queueId, String);
  Queues.find({ _id: queueId });
});

Meteor.publish('activeQueues', () => {
  return Queues.find({ status: { $nin: ['ended', 'cancelled'] } });
});

Meteor.publish('allQueuesInRange', (course, startTime, endTime) => {
  check(course, String);
  check(startTime, Number);
  check(endTime, Number);

  if (!authorized.hta(this.userId, course)) {
    throw new Meteor.Error('not-allowed');
  }

  startTime = startTime || 0; // eslint-disable-line no-param-reassign
  endTime = endTime || Date.now(); // eslint-disable-line no-param-reassign

  return Queues.find({
    course,
    startTime: { $gte: startTime, $lte: endTime },
  });
});
