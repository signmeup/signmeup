import { Migrations } from 'meteor/percolate:migrations';

import { Courses } from '/imports/api/courses/courses';
import { Locations } from '/imports/api/locations/locations';
import { Queues } from '/imports/api/queues/queues';
import { Tickets } from '/imports/api/tickets/tickets';

Migrations.add({
  version: 1,

  up() {
    // Courses: add 'createdAt' for courses without a creation time
    Courses.find({ createdAt: { $exists: false } }).forEach((course) => {
      Courses.update(course._id, { $set: { createdAt: 0 } });
    });

    // Note: we use {validate: false} here because of a bug in collection2.
    // At this point, it does not let you $unset fields that are not in the
    // schema. More details here: https://github.com/aldeed/meteor-simple-schema/issues/519

    // Locations: remove 'ips' and 'geo' from all locations
    Locations.update({}, { $unset: { ips: '', geo: '' } }, { multi: true, validate: false });

    // Queues: remove 'mode' and 'localSettings' from all queues
    Queues.update({}, {
      $unset: { mode: '', localSettings: '' },
    }, {
      multi: true,
      validate: false,
    });

    // Tickets: remove 'missedAt' and 'flag'
    Tickets.update({}, { $unset: { missedAt: '', flag: '' } }, { multi: true, validate: false });
  },

  down() {
    Locations.update({}, { $set: { ips: [], geo: {} } }, { multi: true });
    Queues.update({}, { $set: { mode: 'universal', localSettings: {} } }, { multi: true });
    Tickets.update({}, { $set: { missedAt: 0, flag: {} } }, { multi: true });
  },
});
