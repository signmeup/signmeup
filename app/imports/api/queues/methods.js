import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Roles } from 'meteor/alanning:roles';

import { Courses } from '/imports/api/courses/courses.js';
import { Locations } from '/imports/api/locations/locations.js';
import { Queues } from '/imports/api/queues/queues.js';
import { Sessions } from '/imports/api/sessions/sessions.js';

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

    // TODO: create cron job

    return queueId;
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
        cutoffBy: this.userId,
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
      throw new Meteor.Error('queues.doesNotExist'
        `No queue exists with id ${queueId}`);
    }

    if (!Roles.userIsInRole(this.userId, ['admin', 'mta', 'hta', 'ta'], queue.courseId)) {
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

    // TODO: turn off cron jobs
  },
});

export const restrictSignups = new ValidatedMethod({
  name: 'queues.restrictSignups',
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
      throw new Meteor.Error('queues.restrictSignups.unauthorized',
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
