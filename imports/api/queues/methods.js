import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Roles } from 'meteor/alanning:roles';
import { Jobs } from 'meteor/msavin:sjobs';
import { _ } from 'meteor/underscore';

import moment from 'moment';

import { Courses } from '/imports/api/courses/courses';
import { Locations } from '/imports/api/locations/locations';
import { Queues } from '/imports/api/queues/queues';
import { Sessions } from '/imports/api/sessions/sessions';

if (Meteor.isServer) {
  Jobs.register({
    'queues.endQueue': function(queueId) {
      Meteor.call('queues.endQueue', { queueId });
      this.success();
    }
  });
}

export const createQueue = new ValidatedMethod({
  name: 'queues.createQueue',
  validate: Queues.simpleSchema().pick([
    'name', 'courseId', 'locationId', 'scheduledEndTime',
  ]).validator(),
  run({ name, courseId, locationId, scheduledEndTime }) {
    if (!Courses.findOne(courseId)) {
      throw new Meteor.Error('courses.doesNotExist',
        `No course exists with id ${courseId}`);
    }

    if (!Locations.findOne(locationId)) {
      throw new Meteor.Error('locations.doesNotExist',
        `No location exists with id ${locationId}`);
    }

    if (!Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], courseId)) {
      throw new Meteor.Error('queues.createQueue.unauthorized',
        'Only TAs and above can create queues.');
    }

    const queueId = Queues.insert({
      name,
      courseId,
      locationId,
      scheduledEndTime,

      createdAt: new Date(),
      createdBy: this.userId,
    });

    if (Meteor.isServer) {
      const job = Jobs.run('queues.endQueue', queueId, {
        date: new Date(scheduledEndTime),
      });
      Queues.update({ _id: queueId }, { $set: { endJobId: job._id }});
    }

    return queueId;
  },
});

export const updateQueue = new ValidatedMethod({
  name: 'queues.updateQueue',
  validate: new SimpleSchema({
    queueId: { type: String, regEx: SimpleSchema.RegEx.Id },
    name: { type: String, optional: true },
    locationId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
    scheduledEndTime: { type: Date, optional: true },
  }).validator(),
  run({ queueId, name, locationId, scheduledEndTime }) {
    const queue = Queues.findOne(queueId);
    if (!queue || queue.status === 'ended') {
      throw new Meteor.Error('queues.doesNotExist'
        `No queue exists with id ${queueId}`);
    }

    if (locationId && !Locations.findOne(locationId)) {
      throw new Meteor.Error('locations.doesNotExist',
        `No location exists with id ${locationId}`);
    }

    if (!Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], queue.courseId)) {
      throw new Meteor.Error('queues.createQueue.unauthorized',
        'Only TAs and above can update queues.');
    }

    const setFields = {};

    if (name !== queue.name) {
      setFields.name = name;
    }

    if (locationId !== queue.locationId) {
      setFields.locationId = locationId;
    }

    if (scheduledEndTime !== queue.scheduledEndTime) {
      setFields.scheduledEndTime = scheduledEndTime;
      if (Meteor.isServer) {
        // Jobs.reschedule seems to be broken
        Jobs.cancel(queue.endJobId);
        const job = Jobs.run('queues.endQueue', queueId, {
          date: new Date(scheduledEndTime),
        });
        setFields.endJobId = job._id;
      }
    }

    Queues.update({
      _id: queueId,
    }, {
      $set: setFields,
    });
  },
});

export const openQueue = new ValidatedMethod({
  name: 'queues.openQueue',
  validate: new SimpleSchema({
    queueId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ queueId }) {
    const queue = Queues.findOne(queueId);
    if (!queue || queue.status === 'ended') {
      throw new Meteor.Error('queues.doesNotExist'
        `No queue exists with id ${queueId}`);
    }

    if (!Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], queue.courseId)) {
      throw new Meteor.Error('queues.openQueue.unauthorized',
        'Only TAs and above can open queues.');
    }

    Queues.update({
      _id: queueId,
    }, {
      $set: {
        status: 'open',
      },

      $unset: {
        cutoffAt: '',
        cutoffAfter: '',
        cutoffBy: '',
      },
    });
  },
});

export const cutoffQueue = new ValidatedMethod({
  name: 'queues.cutoffQueue',
  validate: new SimpleSchema({
    queueId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ queueId }) {
    const queue = Queues.findOne(queueId);
    if (!queue || queue.status === 'ended') {
      throw new Meteor.Error('queues.doesNotExist'
        `No queue exists with id ${queueId}`);
    }

    if (!Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], queue.courseId)) {
      throw new Meteor.Error('queues.cutoffQueue.unauthorized',
        'Only TAs and above can cutoff queues.');
    }

    Queues.update({
      _id: queueId,
    }, {
      $set: {
        status: 'cutoff',
        cutoffAt: new Date(),
        cutoffAfter: queue.ticketIds[queue.ticketIds.length - 1],
        cutoffBy: this.userId,
      },
    });
  },
});

export const shuffleQueue = new ValidatedMethod({
  name: 'queues.shuffleQueue',
  validate: new SimpleSchema({
    queueId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ queueId }) {
    const queue = Queues.findOne(queueId);
    if (!queue || queue.status === 'ended') {
      throw new Meteor.Error('queues.doesNotExist'
        `No queue exists with id ${queueId}`);
    }

    if (this.connection && !Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], queue.courseId)) { // eslint-disable-line max-len
      throw new Meteor.Error('queues.shuffleQueue.unauthorized',
        'Only TAs and above can shuffle queues.');
    }

    if (queue.isCutoff()) {
      throw new Meteor.Error('queues.shuffleQueue.cannotShuffleCutoffQueue',
        'Cannot shuffle a cutoff queue.');
    }

    const activeTicketIds = queue.activeTicketIds();
    const inactiveTicketIds = queue.ticketIds.filter((ticketId) => {
      return !(activeTicketIds.indexOf(ticketId) >= 0);
    });

    const shuffledTicketIds = inactiveTicketIds.concat(_.shuffle(activeTicketIds));

    Queues.update({
      _id: queueId,
    }, {
      $set: {
        ticketIds: shuffledTicketIds,
      },
    });
  },
});

export const endQueue = new ValidatedMethod({
  name: 'queues.endQueue',
  validate: new SimpleSchema({
    queueId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ queueId }) {
    const queue = Queues.findOne(queueId);
    if (!queue || queue.status === 'ended') {
      throw new Meteor.Error('queues.doesNotExist',
        `No queue exists with id ${queueId}`);
    }

    if (this.connection && !Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], queue.courseId)) { // eslint-disable-line max-len
      throw new Meteor.Error('queues.endQueue.unauthorized',
        'Only TAs and above can end queues.');
    }

    Queues.update({
      _id: queueId,
    }, {
      $set: {
        status: 'ended',
        endedAt: new Date(),
        endedBy: this.userId,
      },
    });

    if (Meteor.isServer) {
      Jobs.cancel(queue.endJobId);
    }
  },
});

export const reopenQueue = new ValidatedMethod({
  name: 'queues.reopenQueue',
  validate: new SimpleSchema({
    queueId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ queueId }) {
    const queue = Queues.findOne(queueId);
    if (!queue) {
      throw new Meteor.Error('queues.doesNotExist',
        `No queue exists with id ${queueId}`);
    } else if (queue.status !== 'ended') {
      throw new Meteor.Error('queues.reopenQueue.notEnded',
        'Only ended queues can be reopened');
    }

    if (this.connection && !Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], queue.courseId)) { // eslint-disable-line max-len
      throw new Meteor.Error('queues.endQueue.unauthorized',
        'Only TAs and above can reopen queues.');
    }

    let restoredStatus = 'open';
    if (queue.cutoffAt) {
      restoredStatus = 'cutoff';
    }

    let newTime = moment().add(1, 'hour').startOf('hour').toDate();
    if (queue.scheduledEndTime > new Date()) {
      // If original end time hasn't passed yet, use it as the end time again
      newTime = queue.scheduledEndTime;
    }

    Queues.update({
      _id: queueId,
    }, {
      $set: {
        status: restoredStatus,
        scheduledEndTime: newTime,
      },
      $unset: {
        endedAt: '',
        endedBy: '',
      },
    });
  },
});

export const restrictToSession = new ValidatedMethod({
  name: 'queues.restrictToSession',
  validate: new SimpleSchema({
    queueId: { type: String, regEx: SimpleSchema.RegEx.Id },
    name: { type: String },
    userAgent: { type: String },
    secret: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ queueId, name, userAgent, secret }) {
    const queue = Queues.findOne(queueId);
    if (!queue) {
      throw new Meteor.Error('queues.doesNotExist',
        `No queue exists with id ${queueId}`);
    }

    if (!Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], queue.courseId)) {
      throw new Meteor.Error('queues.restrictToSession.unauthorized',
        'Only TAs and above can restrict queue signups.');
    }

    const sessionId = Sessions.insert({
      name,
      queueId,
      userId: this.userId,
      userAgent,
      secret,
    });

    Queues.update({
      _id: queueId,
    }, {
      $push: { 'settings.restrictedSessionIds': sessionId },
    });

    return sessionId;
  },
});

export const releaseFromSession = new ValidatedMethod({
  name: 'queues.releaseFromSession',
  validate: new SimpleSchema({
    queueId: { type: String, regEx: SimpleSchema.RegEx.Id },
    sessionId: { type: String, regEx: SimpleSchema.RegEx.Id },
  }).validator(),
  run({ queueId, sessionId }) {
    const queue = Queues.findOne(queueId);
    if (!queue) {
      throw new Meteor.Error('queues.doesNotExist',
        `No queue exists with id ${queueId}`);
    }

    if (!Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], queue.courseId)) {
      throw new Meteor.Error('queues.restrictToSession.unauthorized',
        'Only TAs and above can release queues from sessions.');
    }

    Queues.update({
      _id: queueId,
    }, {
      $pull: { 'settings.restrictedSessionIds': sessionId },
    });
  },
});
