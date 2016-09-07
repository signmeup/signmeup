// Waiting Time Calcuator
//
// For now, just a running average of the time spent
// between creating a ticket to it being marked as done.
//
// In the future, use the Waiting Time formula
// from queueing theory as detailed here:
// https://www.utdallas.edu/~metin/Or6302/Folios/omqueue.pdf.

import { _ } from 'meteor/underscore';

import { Queues } from '/imports/api/queues/queues';
import { Tickets } from '/imports/api/tickets/tickets';

function calculateWaitTime(ticket, queue) {
  const allTickets = Tickets.find({
    _id: { $in: queue.tickets },
  }).fetch();

  const completedTickets = _.filter(allTickets, (t) => {
    return t.status === 'done';
  });

  const averageTimeSoFar = queue.averageWaitTime;
  const totalWaitTime = averageTimeSoFar * completedTickets.length;

  const ticketWaitTime = ticket.doneAt - ticket.createdAt;
  const newAverage = Math.floor((totalWaitTime + ticketWaitTime) / (completedTickets.length + 1));

  return newAverage;
}

export function updateWaitTime(lastTicketId) {
  const ticket = Tickets.findOne(lastTicketId);
  const queue = Queues.findOne(ticket.queueId);

  const newAverage = calculateWaitTime(ticket, queue);

  Queues.update(ticket.queueId, {
    $set: { averageWaitTime: newAverage },
  });
}
