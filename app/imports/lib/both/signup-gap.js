// Helper to calculate nextSignupTime for a user in a queue

import { _ } from 'meteor/underscore';

import Courses from '/imports/api/courses/courses';
import Queues from '/imports/api/queues/queues';
import Tickets from '/imports/api/tickets/tickets';

// Calculate the next possible time that the given user can sign up for this
// queue. Usually they can re-signup instantly, but if a signupGap is set, they
// need to wait at least that long before signing up again.
export function _nextSignupTime(userId, queueId) {
  const queue = Queues.findOne(queueId);
  const tickets = _.map(queue.tickets, (id) => {
    return Tickets.findOne(id);
  });

  const userTickets = _.filter(tickets, (t) => {
    return t.owner.id === userId;
  });

  // If no tickets by the user, return undefined.
  if (userTickets.length === 0) return null;

  let lastUsedTicket; // The last ticket that's open or done.
  for (let i = userTickets.length - 1; i >= 0; i--) {
    const ticket = userTickets[i];
    if (ticket.status !== 'cancelled') {
      lastUsedTicket = ticket;
      break;
    }
  }

  // If only cancelled tickets exist, return null.
  if (typeof lastUsedTicket === 'undefined') return null;

  // If an open ticket exists, return null.
  if (lastUsedTicket.status === 'open') return null;

  // Otherwise, calculate the next possible signup time.
  const courseSettings = Courses.findOne({ name: queue.course }).settings || {};
  const signupGap = courseSettings.signupGap || 0;
  return lastUsedTicket.doneAt + signupGap;
}
