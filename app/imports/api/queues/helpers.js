import Courses from '/imports/api/courses/courses.js';
import Locations from '/imports/api/locations/locations.js';
import Queues from '/imports/api/queues/queues.js';
import Sessions from '/imports/api/sessions/sessions.js';
import Tickets from '/imports/api/tickets/tickets.js';

Queues.helpers({
  course() {
    return Courses.findOne(this.courseId);
  },

  location() {
    return Locations.findOne(this.locationId);
  },

  tickets() {
    return Tickets.find({ _id: { $in: this.ticketIds } });
  },

  activeTickets() {
    return Tickets.find({
      _id: { $in: this.ticketIds },
      status: { $in: ['open', 'claimed'] },
    });
  },

  isRestricted() {
    return this.settings.restrictedSessionIds.length > 0;
  },

  restrictedSessions() {
    return Sessions.find({
      _id: { $in: this.settings.restrictedSessionIds },
    });
  },
});
