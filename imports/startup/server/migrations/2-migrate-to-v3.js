import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';

import { Courses } from '/imports/api/courses/courses';
import { Locations } from '/imports/api/locations/locations';
import { Queues } from '/imports/api/queues/queues';
import { Tickets } from '/imports/api/tickets/tickets';

Migrations.add({
  version: 2,

  up() {
    // Announcements
    // - Does not exist on the database currently. NOOP.

    // Courses
    // - Remove listserv
    // - Remove tas, htas; add roles instead
    // - Add settings, settings.restrictSessionsByDefault, settings.notifications
    Courses.find().forEach((course) => {
      const htas = course.htas || [];
      const tas = course.tas || [];

      Courses.update(course._id, {
        $unset: {
          listserv: '',
          htas: '',
          tas: '',
        },

        $set: {
          createdAt: new Date(course.createdAt || Date.now()),
          settings: {
            signupGap: course.signupGap || 0,
            restrictSessionsByDefault: false,
            notifications: {
              allowEmail: true,
              allowText: true,
            },
          },
        },
      }, {
        validate: false,
      });

      Roles.addUsersToRoles(htas, 'hta', course._id);
      Roles.addUsersToRoles(tas, 'ta', course._id);
    });

    // Locations
    // - Schema has not changed. We're removing locations with empty names.
    Locations.remove({ name: '' });

    // Queues
    // - Replace course with courseId
    // - Rename location to locationId
    // - Rename status: active to status: open
    // - Replace owner with createdBy, only store user ID
    // - Replace startTime with createdAt, modify to Date
    // - Replace cutoffTime with cutoffAt, modify to Date
    // - Replace endTime with endedAt, modify to Date
    // - Remove averageWaitTime
    // - Rename announcements to announcementIds
    // - Rename tickets to ticketIds
    Queues.find().forEach((queue) => {
      const course = Courses.findOne({ name: queue.course });

      const set = {
        courseId: course._id,
        locationId: queue.location,

        createdAt: new Date(queue.startTime),
        createdBy: queue.owner.id,

        announcementIds: queue.announcements,
        ticketIds: queue.tickets,

        settings: {
          restrictedSessionIds: [],
        },

        scheduledEndTime: queue.endTime,
        endedAt: queue.endTime,
      };

      if (queue.status === 'active') {
        set.status = 'open';
      }

      if (queue.cutoffTime) {
        set.cutoffAt = new Date(queue.cutoffTime);
      }

      Queues.update(queue._id, {
        $unset: {
          course: '',
          location: '',

          owner: '',

          announcements: '',
          tickets: '',

          startTime: '',
          cutoffTime: '',
          endTime: '',
          averageWaitTime: '',
        },

        $set: set,
      }, {
        validate: false,
      });
    });

    // Sessions
    // - Does not exist on the database currently. NOOP.

    // Tickets
    // - Replace course with courseId
    // - Replace owner with studentIds and createdBy
    // - Replace statuses; done -> markedAsDone; cancelled -> deleted
    // - Replace notify with notifications
    //       - If types has announce, set announce: true
    //       - If types has email, set email
    //       - If types has text, set phone -> phone.number, carrier -> phone.carrier
    //       - Drop notify.sent
    // - Remove TA; update 'deletedBy' or 'markedAsDoneBy' if TA exists
    // - Modify createdAt to Date
    // - Replace doneAt with markedAsDoneAt, modify to Date
    // - Replace cancelledAt with deletedAt, modify to Date
    Tickets.find().forEach((ticket) => {
      const course = Courses.findOne({ name: ticket.course });

      const set = {
        courseId: course._id,
        studentIds: [ticket.owner.id],
        createdBy: ticket.owner.id,
        createdAt: new Date(ticket.createdAt),
      };

      if (ticket.status === 'done') {
        set.status = 'markedAsDone';

        if (ticket.doneAt) {
          set.markedAsDoneAt = new Date(ticket.doneAt);
        }
      }

      if (ticket.status === 'cancelled') {
        set.status = 'deleted';

        if (ticket.cancelledAt) {
          set.deletedAt = new Date(ticket.cancelledAt);
        }
      }

      if (ticket.notify) {
        set.notifications = {};
        const types = ticket.notify.types || [];

        if (_.contains(types, 'announce')) {
          set.notifications.announce = true;
        }

        if (_.contains(types, 'email') && ticket.notify.email) {
          set.notifications.email = ticket.notify.email;
        }

        if (_.contains(types, 'text')) {
          set.notifications.phone = {};
          set.notifications.phone.number = ticket.notify.phone;
          set.notifications.phone.carrier = ticket.notify.carrier;
        }
      }

      if (ticket.ta) {
        if (ticket.status === 'done') {
          set.markedAsDoneBy = ticket.ta.id;
        }

        if (ticket.status === 'cancelled') {
          set.deletedBy = ticket.ta.id;
        }
      }

      Tickets.update(ticket._id, {
        $unset: {
          course: '',
          owner: '',

          notify: '',
          ta: '',

          doneAt: '',
          cancelledAt: '',
        },

        $set: set,
      }, {
        validate: false,
      });
    });

    // Users
    // - Remove admin, taCourses, htaCourses; add roles instead
    Meteor.users.find().forEach((user) => {
      if (user.admin) {
        Roles.addUsersToRoles(user._id, 'admin', Roles.GLOBAL_GROUP);
      }

      Meteor.users.update(user._id, {
        $unset: {
          admin: '',
          htaCourses: '',
          taCourses: '',
        },
      }, {
        validate: false,
      });
    });
  },

  down() {
    // Skipping because the migration is extremely complex.
    // The data has been backed up in case we need to go back.
  },
});
