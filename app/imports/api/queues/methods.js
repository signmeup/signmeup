import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { Roles } from 'meteor/alanning:roles';

import Courses from '/imports/api/courses/courses.js';
import Locations from '/imports/api/locations/locations.js';
import Queues from '/imports/api/queues/queues.js';
import Sessions from '/imports/api/sessions/sessions.js';

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

    return queueId;
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
