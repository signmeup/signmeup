import { _ } from 'meteor/underscore';

import { Courses } from '/imports/api/courses/courses.js';
import { Locations } from '/imports/api/locations/locations.js';
import { Queues } from '/imports/api/queues/queues.js';
import { Sessions } from '/imports/api/sessions/sessions.js';
import { Tickets } from '/imports/api/tickets/tickets.js';

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
    // We map ticketIds to tickets rather than use a $in query in order to
    // preserve order of tickets.
    return this.ticketIds.map((ticketId) => {
      return Tickets.findOne({ _id: ticketId });
    }).filter((ticket) => {
      // Filter in case the client has not subscribed to all tickets; this happens
      // because students aren't allowed access to deleted tickets.
      return ticket !== undefined;
    });
  },

  activeTickets() {
    return this.tickets().filter((ticket) => {
      return ticket.isActive();
    });
  },

  activeTicketIds() {
    return this.activeTickets().map((ticket) => {
      return ticket._id;
    });
  },

  hasActiveTicketWithUsers(userIds) {
    const activeTickets = this.activeTickets();
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
