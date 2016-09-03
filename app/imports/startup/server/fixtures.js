// Functions to initialize collections

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import moment from 'moment';

import Courses from '/imports/api/courses/courses.js';
import Locations from '/imports/api/locations/locations.js';
import Queues from '/imports/api/queues/queues.js';

import { createCourse } from '/imports/api/courses/methods.js';
import { createLocation } from '/imports/api/locations/methods.js';
import { createQueue } from '/imports/api/queues/methods.js';

let testCourseId;
let testLocationId;
let testTAId;

function createUser(options) {
  let userId = null;
  if (options.saml) {
    const user = Meteor.users.findOne({ email: options.email });
    if (user) return;

    userId = Meteor.users.insert({ email: options.email, profile: {} });
  } else {
    const user = Meteor.users.findOne({ 'emails.address': options.email });
    if (user) return;

    userId = Accounts.createUser({
      email: options.email,
      password: options.password,
      profile: { name: options.name },
    });
  }

  switch (options.type) {
    case 'admin':
      Roles.addUsersToRoles(userId, 'admin', Roles.GLOBAL_GROUP);
      break;
    case 'mta':
      Roles.addUsersToRoles(userId, 'mta', Roles.GLOBAL_GROUP);
      break;
    case 'hta':
      Roles.addUsersToRoles(userId, 'hta', options.testCourseId);
      break;
    case 'ta':
      testTAId = userId;
      Roles.addUsersToRoles(userId, 'ta', options.testCourseId);
      break;
    default:
      break;
  }
}

function createUsers() {
  const users = Meteor.settings.users;
  users.forEach((user) => {
    createUser(Object.assign(user, { testCourseId }));
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

init();
