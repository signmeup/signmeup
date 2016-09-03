// Functions to initialize collections

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

import moment from 'moment';

import { createCourse } from '/imports/api/courses/methods.js';
import { createQueue } from '/imports/api/queues/methods.js';

function createUser(options) {
  let userId = null;
  if (options.saml) {
    const user = Meteor.users.findOne({ email: options.email });
    if (!user) {
      userId = Meteor.users.insert({ email: options.email, profile: {} });
    } else {
      userId = user._id;
    }
  } else {
    const user = Meteor.users.findOne({ 'emails.address': options.email });
    if (!user) {
      userId = Accounts.createUser({
        email: options.email,
        password: options.password,
        profile: { name: options.name },
      });
    } else {
      userId = user._id;
    }
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
      Roles.addUsersToRoles(userId, 'ta', options.testCourseId);
      break;
    default:
      break;
  }
}

function createUsers(testCourseId) {
  const users = Meteor.settings.users;
  users.forEach((user) => {
    createUser(Object.assign(user, { testCourseId }));
  });
}

// function initializeCollections() {
//   // Courses
//   const testCourse = Courses.findOne({ name: 'cs00' });
//   if (!testCourse) {
//     Courses.insert({
//       name: 'cs00',
//       description: 'Test Course',
//       listserv: 'cs00tas@cs.brown.edu',
//       active: true,
//
//       settings: {},
//       createdAt: Date.now(),
//     });
//   }
//
//   // Locations
//   const testLocation = Locations.findOne({ name: 'Test Location' });
//   if (!testLocation) {
//     Locations.insert({
//       name: 'Test Location',
//
//       ips: [],
//       geo: {},
//     });
//   }
//
//   // Queues
//   const testQueue = Queues.findOne({ name: 'Test Queue', course: 'cs00' });
//   if (!testQueue) {
//     const endTime = Date.now() + 3 * (60 * 60 * 1000);
//     Meteor.call('createQueue', 'cs00', 'Test Queue', 'Test Location', endTime, testTAId);
//   }
// }

function init() {
  const testCourseId = createCourse.call({
    name: 'cs00',
    description: 'Test Course',
  });

  createUsers(testCourseId);

  createQueue.call({
    name: 'TA Hours',
    courseId: testCourseId,
    locationId: testCourseId,
    scheduledEndTime: moment().add(4, 'hours').startOf('hour').toDate(),
  });
}

init();
