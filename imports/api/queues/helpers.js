import { _ } from 'meteor/underscore';

import GeoPattern from 'geopattern';
import moment from 'moment';

import { Courses } from '/imports/api/courses/courses';
import { Locations } from '/imports/api/locations/locations';
import { Queues } from '/imports/api/queues/queues';
import { Sessions } from '/imports/api/sessions/sessions';
import { Tickets } from '/imports/api/tickets/tickets';

// Static helpers

export function activeQueues() {
  return Queues.find({ status: { $in: ['open', 'cutoff'] } });
}

export function sortedActiveQueues() {
  const queues = activeQueues().fetch();
  return queues.sort((a, b) => {
    const courseA = a.course().name;
    const courseB = b.course().name;
    return courseA.localeCompare(courseB);
  });
}

export function queueEndTimes() {
  const result = [];

  const time = moment().add(1, 'hour').startOf('hour');
  while (time <= moment().add(1, 'day').startOf('day')) {
    result.push({
      formattedString: time.format('LT'),
      ISOString: time.toISOString(),
    });
    time.add(15, 'minutes');
  }

  return result;
}

// Collection helpers

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
    return Tickets.find({ queueId: this._id });
  },

  activeTickets() {
    return Tickets.find({
      queueId: this._id,
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

  claimedTickets() {
    return Tickets.find({
      queueId: this._id,
      status: 'claimed',
    });
  },

  topTicket() {
    return Tickets.find({
      queueId: this._id,
      status: { $in: ['open', 'claimed', 'markedAsMissing'] },
    }, {
      sort: { createdAt: 1 },
      limit: 1,
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

  svgPatternUrl() {
    const svgPattern = GeoPattern.generate(this.course().name);
    return svgPattern.toDataUrl();
  },

  formatTicketCount() {
    const activeTicketsCount = this.activeTickets().count();
    return `${activeTicketsCount} ticket${activeTicketsCount !== 1 ? 's' : ''}`;
  },

  formatScheduledEndTime() {
    return moment(this.scheduledEndTime).format('LT');
  },
});
