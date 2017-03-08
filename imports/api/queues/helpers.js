import { _ } from 'meteor/underscore';

import { Courses } from '/imports/api/courses/courses';
import { Locations } from '/imports/api/locations/locations';
import { Queues } from '/imports/api/queues/queues';
import { Sessions } from '/imports/api/sessions/sessions';
import { Tickets } from '/imports/api/tickets/tickets';

Queues.helpers({
  course() {
    return Courses.findOne(this.courseId);
  },

  location() {
    return Locations.findOne(this.locationId);
  },

  isOpen() {
    return this.status === 'open';
  },

  isCutoff() {
    return this.status === 'cutoff';
  },

  isEnded() {
    return this.status === 'ended';
  },

  tickets() {
    return Tickets.find({ _id: { $in: this.ticketIds } });
  },

  activeTickets() {
    return Tickets.find({
      _id: { $in: this.ticketIds },
      status: { $in: ['open', 'claimed', 'markedAsMissing'] },
    });
  },

  activeTicketIds() {
    return this.activeTickets().map((ticket) => {
      return ticket._id;
    });
  },

  hasActiveTicketWithUsers(userIds) {
    const activeTickets = this.activeTickets().fetch();
    return activeTickets.some((ticket) => {
      return _.intersection(ticket.studentIds, userIds).length > 0;
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

  requireLogin() {
    return !this.isRestricted();
  },
});
