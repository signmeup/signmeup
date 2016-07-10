// Queue Methods

// TODO: Replace input error checks with check()
// TODO: Replace 'not-allowed' errors with 403 errors

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SyncedCron } from 'meteor/percolate:synced-cron';
import { _ } from 'meteor/underscore';

import Courses from '/imports/api/courses/courses';
import Locations from '/imports/api/locations/locations';
import Queues from '/imports/api/queues/queues';
import Tickets from '/imports/api/tickets/tickets';

import { authorized } from '/imports/lib/both/auth';
import { _getUserEmail } from '/imports/lib/both/users';
import { _filterActiveTicketIds, _activeTickets } from '/imports/lib/both/filters';

Meteor.methods({
  createQueue(course, name, location, endTime, ownerId) {
    check(course, String);
    check(name, String);
    check(location, String);
    check(endTime, Number);
    check(ownerId, String);

    const clientCall = !!(this.connection);
    if (clientCall && !authorized.ta(Meteor.userId, course)) {
      throw new Meteor.Error('not-allowed');
    }

    if (!Courses.find({ name: course }).fetch()) {
      throw new Meteor.Error('invalid-course-name');
    }

    let locationId;
    const locationObject = Locations.findOne({ name: location });
    if (locationObject) {
      locationId = locationObject._id;
    } else {
      locationId = Locations.insert({
        name: location,
      });
    }

    if (endTime <= Date.now()) {
      throw new Meteor.Error('invalid-end-time');
    }

    if (clientCall) {
      ownerId = Meteor.userId(); // eslint-disable-line no-param-reassign
    }

    // Create queue
    const queue = {
      name,
      course,
      location: locationId,

      status: 'active',
      owner: {
        id: ownerId,
        email: _getUserEmail(ownerId),
      },

      startTime: Date.now(),
      endTime,
      averageWaitTime: 0,

      announcements: [],
      tickets: [],
    };

    let queueId = Queues.insert(queue);
    console.log(`Created queue ${queueId}`);

    // Create ender cron job
    console.log('Creating cron job');
    SyncedCron.add({
      name: `${queueId}-ender`,
      schedule(parser) {
        const date = new Date(endTime);
        return parser.recur().on(date).fullDate();
      },
      job() {
        queueId = this.name.split('-')[0];
        Meteor.call('endQueue', queueId);
      },
    });
  },

  updateQueue(queueId, name, location, endTime) {
    check(queueId, String);
    check(name, String);
    check(location, String);
    check(endTime, Number);

    const queue = Queues.findOne({ _id: queueId });
    if (!queue) {
      throw new Meteor.Error('invalid-queue-id');
    }
    if (!authorized.ta(Meteor.userId, queue.course)) {
      throw new Meteor.Error('not-allowed');
    }

    let locationId;
    const locationObject = Locations.findOne({ name: location });
    if (locationObject) {
      locationId = locationObject._id;
    } else {
      locationId = Locations.insert({
        name: location,
      });
    }

    if (endTime <= Date.now()) {
      throw new Meteor.Error('invalid-end-time');
    }

    Queues.update(queueId, {
      $set: {
        name,
        location: locationId,
        endTime,
      },
    });

    // Remove old cron job, create new one
    SyncedCron.remove(`${queueId}-ender`);
    console.log('Creating cron job');
    SyncedCron.add({
      name: `${queueId}-ender`,
      schedule(parser) {
        const date = new Date(endTime);
        return parser.recur().on(date).fullDate();
      },
      job() {
        const queueId = this.name.split('-')[0];
        Meteor.call('endQueue', queueId);
      },
    });
  },

  clearQueue(queueId) {
    check(queueId, String);

    const queue = Queues.findOne({ _id: queueId });
    if (!queue) {
      throw new Meteor.Error('invalid-queue-id');
    }

    if (queue.status === 'ended') {
      throw new Meteor.Error('queue-ended');
    }

    if (!authorized.ta(Meteor.userId, queue.course)) {
      throw new Meteor.Error('not-allowed');
    }

    const activeTicketIds = _.map(_activeTickets(queue.tickets), (t) => {
      return t._id;
    });

    Tickets.update({ _id: { $in: activeTicketIds } }, {
      $set: { status: 'cancelled' },
    });
  },

  shuffleQueue(queueId) {
    check(queueId, String);

    const queue = Queues.findOne({ _id: queueId });
    if (!queue) {
      throw new Meteor.Error('invalid-queue-id');
    }

    if (queue.status === 'ended') {
      throw new Meteor.Error('queue-ended');
    }

    if (!authorized.ta(Meteor.userId, queue.course)) {
      throw new Meteor.Error('not-allowed');
    }

    const activeTicketIds = _filterActiveTicketIds(queue.tickets);
    const startingIndex = queue.tickets.indexOf(activeTicketIds[0]);
    const newTickets = queue.tickets.slice(0, startingIndex).concat(_.shuffle(activeTicketIds));

    Queues.update({ _id: queueId }, {
      $set: { tickets: newTickets },
    });
    console.log(`Shuffled tickets for ${queueId}`);
  },

  activateQueue(queueId) {
    check(queueId, String);

    // Make a cutoff queue active again
    const queue = Queues.findOne({ _id: queueId });
    if (!queue) {
      throw new Meteor.Error('invalid-queue-id');
    }

    if (queue.status === 'ended') {
      throw new Meteor.Error('queue-ended');
    }

    if (!authorized.ta(Meteor.userId, queue.course)) {
      throw new Meteor.Error('not-allowed');
    }

    Queues.update(queueId, {
      $set: { status: 'active' },
      $unset: { cutoffTime: '' },
    });
  },

  cutoffQueue(queueId) {
    check(queueId, String);

    const queue = Queues.findOne({ _id: queueId });
    if (!queue) {
      throw new Meteor.Error('invalid-queue-id');
    }

    if (queue.status === 'ended') {
      throw new Meteor.Error('queue-ended');
    }

    if (!authorized.ta(Meteor.userId, queue.course)) {
      throw new Meteor.Error('not-allowed');
    }

    console.log(`Cutting off ${queueId}`);

    Queues.update(queueId, {
      $set: {
        status: 'cutoff',
        cutoffTime: Date.now(),
      },
    });
  },

  endQueue(queueId) {
    check(queueId, String);

    const queue = Queues.findOne({ _id: queueId });
    if (!queue) {
      throw new Meteor.Error('invalid-queue-id');
    }

    const clientCall = !!(this.connection);
    if (clientCall && !authorized.ta(Meteor.userId, queue.course)) {
      throw new Meteor.Error('not-allowed');
    }

    console.log(`Ending queue ${queueId}`);

    // TODO: Cancel active tickets?

    SyncedCron.remove(`${queueId}-ender`);

    Queues.update(queueId, {
      $set: {
        status: 'ended',
        endTime: Date.now(),
      },
    });
  },
});
