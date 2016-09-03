/* eslint-disable prefer-arrow-callback */

import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

import Queues from '/imports/api/queues/queues';

Meteor.publish('queues.byId', function byId(queueId) {
  return Queues.findOne(queueId);
});

Meteor.publish('queues.active', function active() {
  return Queues.find({ status: { $in: ['open', 'cutoff'] } });
});

Meteor.publish('queues.inRange', function inRange(courseId, startTime, endTime) {
  if (!Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], courseId)) {
    throw new Meteor.Error('queues.inRange.unauthorized',
      'Only TAs and above can get queues from a specified range.');
  }

  return Queues.find({
    courseId,
    createdAt: {
      $gte: startTime.toISOString(),
      $lte: endTime.toISOString(),
    },
  });
});
