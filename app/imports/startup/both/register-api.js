// Register collections, methods, helpers, and publications

import { Meteor } from 'meteor/meteor';

import '/imports/api/announcements/methods.js';

import '/imports/api/courses/methods.js';

import '/imports/api/locations/methods.js';

import '/imports/api/queues/methods.js';
import '/imports/api/queues/helpers.js';

import '/imports/api/sessions/methods.js';

import '/imports/api/tickets/methods.js';

import '/imports/api/users/users.js';
import '/imports/api/users/helpers.js';
import '/imports/api/users/methods.js';

if (Meteor.isServer) {
  /* eslint-disable global-require */
  require('/imports/api/announcements/server/publications.js');
  require('/imports/api/courses/server/publications.js');
  require('/imports/api/locations/server/publications.js');
  require('/imports/api/queues/server/publications.js');
  require('/imports/api/sessions/server/publications.js');
  require('/imports/api/tickets/server/publications.js');
  require('/imports/api/users/server/publications.js');
  /* eslint-enable global-require */
}
