// Functions to initialize collections

import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';

import moment from 'moment';

import { Courses } from '/imports/api/courses/courses';
import { Locations } from '/imports/api/locations/locations';
import { Queues } from '/imports/api/queues/queues';

import { createCourse } from '/imports/api/courses/methods';
import { createLocation } from '/imports/api/locations/methods';
import { createQueue } from '/imports/api/queues/methods';
import { createUser } from '/imports/lib/both/users';

let testCourseId;
let testLocationId;
let testQueueCreatorId;

function createUsers() {
  const users = Meteor.settings.users;
  users.forEach((user) => {
    // Create user
    const userId = createUser(user);

    // Add roles to new user
    switch (user.type) {
      case 'admin':
        Roles.addUsersToRoles(userId, 'admin', Roles.GLOBAL_GROUP);
        break;
      case 'mta':
        Roles.addUsersToRoles(userId, 'mta', Roles.GLOBAL_GROUP);
        break;
      case 'hta':
        Roles.addUsersToRoles(userId, 'hta', testCourseId);
        break;
      case 'ta':
        Roles.addUsersToRoles(userId, 'ta', testCourseId);
        break;
      default:
        break;
    }

    if (!testQueueCreatorId && user.type !== 'student') {
      testQueueCreatorId = userId;
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
    createQueue.run.call({ userId: testQueueCreatorId }, {
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
