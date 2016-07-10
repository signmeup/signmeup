// Functions to initialize collections

import { Meteor, Accounts } from 'meteor/meteor';
import { _ } from 'meteor/underscore';

import Courses from '/imports/api/courses/courses';
import Locations from '/imports/api/locations/locations';
import Queues from '/imports/api/queues/queues';

let testHTAId;
let testTAId;

function createTestUser(name, email, password, type, course) {
  let userId;
  const user = Meteor.users.findOne({
    'emails.address': email,
  });

  if (!user) {
    console.log(`Creating ${email}...`); // eslint-disable-line no-console
    userId = Accounts.createUser({
      email,
      password,
      profile: {
        name,
      },
    });
  }

  // Set admin
  if (type === 'admin') {
    Meteor.users.update({
      'emails.address': email,
    }, {
      $set: {
        admin: true,
      },
    });
  }

  // Set HTA
  if (type === 'hta') {
    testHTAId = userId;
    Meteor.users.update({
      'emails.address': email,
    }, {
      $set: {
        htaCourses: [course],
      },
    });
  }

  // Set TA
  if (type === 'ta') {
    testTAId = userId;
    Meteor.users.update({
      'emails.address': email,
    }, {
      $set: {
        taCourses: [course],
      },
    });
  }
}

function createTestUsers() {
  const users = Meteor.settings.users;
  _.each(users, (u) => {
    if (u.saml) {
      const user = Meteor.users.findOne({ email: u.email });
      if (!user) {
        const userId = Meteor.users.insert({ email: u.email, profile: {} });
        if (u.type === 'admin') {
          Meteor.users.update(userId, { $set: { admin: true } });
        }

        // TODO: Support other types of SAML users,
        // by simply merging this logic into createTestUser()
      }
    } else {
      createTestUser(u.name, u.email, u.password, u.type, 'cs00');
    }
  });
}

function initializeCollections() {
  // Courses
  const testCourse = Courses.findOne({ name: 'cs00' });
  if (!testCourse) {
    Courses.insert({
      name: 'cs00',
      description: 'Test Course',
      listserv: 'cs00tas@cs.brown.edu',
      active: true,

      htas: [testHTAId],
      tas: [testTAId],

      settings: {},
      createdAt: Date.now(),
    });
  }

  // Locations
  const testLocation = Locations.findOne({ name: 'Test Location' });
  if (!testLocation) {
    Locations.insert({
      name: 'Test Location',

      ips: [],
      geo: {},
    });
  }

  // Queues
  const testQueue = Queues.findOne({ name: 'Test Queue', course: 'cs00' });
  if (!testQueue) {
    const endTime = Date.now() + 3 * (60 * 60 * 1000);
    Meteor.call('createQueue', 'cs00', 'Test Queue', 'Test Location', endTime, testTAId);
  }
}

createTestUsers();
initializeCollections();
