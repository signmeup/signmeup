// Functions to initialize collections

import { Meteor } from 'meteor/meteor';

import moment from 'moment';

import { Courses } from '/imports/api/courses/courses.js';
import { Locations } from '/imports/api/locations/locations.js';
import { Queues } from '/imports/api/queues/queues.js';

import { createCourse } from '/imports/api/courses/methods.js';
import { createLocation } from '/imports/api/locations/methods.js';
import { createQueue } from '/imports/api/queues/methods.js';
import { createUser } from '/imports/lib/both/users.js';

let testCourseId;
let testLocationId;
let testTAId;

function createUsers() {
  const users = Meteor.settings.users;
  users.forEach((user) => {
    const userId = createUser(Object.assign(user, { testCourseId }));
    if (user.type === 'ta') {
      testTAId = userId;
    }
  });
}

function init() {
  // Course
  const testCourse = Courses.findOne({ name: 'cs00' });
  testCourseId = testCourse ? testCourse._id : createCourse.call({
    name: 'cs00',
    description: 'Test Course',
  });

  // Users
  createUsers();

  // Location
  const testLocation = Locations.findOne({ name: 'Test Location' });
  testLocationId = testLocation ? testLocation._id : createLocation.call({
    name: 'Test Location',
  });

  // Queue
  const testQueue = Queues.findOne({ courseId: testCourseId });
  if (!testQueue) {
    createQueue.run.call({ userId: testTAId }, {
      name: 'TA Hours',
      courseId: testCourseId,
      locationId: testLocationId,
      scheduledEndTime: moment().add(4, 'hours').startOf('hour').toDate(),
    });
  }
}

// Note: we must put this inside a Meteor.startup() block because migrations
// only run inside a Meteor.startup block. We can only setup fixtures after
// migrations are done.
Meteor.startup(() => {
  init();
});
