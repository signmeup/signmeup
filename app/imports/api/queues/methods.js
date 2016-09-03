import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/alanning:roles';

import Courses from '/imports/api/courses/courses.js';
import Locations from '/imports/api/locations/locations.js';
import Queues from '/imports/api/queues/queues.js';

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
