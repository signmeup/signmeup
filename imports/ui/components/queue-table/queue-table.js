import { Template } from 'meteor/templating';

import '/imports/ui/components/ticket/ticket';

import './queue-table.html';

Template.QueueTable.helpers({
  noActiveTickets(queue) {
    return queue.activeTickets().count() === 0;
  },

  rows(queue) {
    const rows = [];

    const tickets = queue.tickets().fetch();
    const ticketsById = {};
    tickets.forEach((ticket) => {
      ticketsById[ticket._id] = ticket;
    });

    let index = 1;
    queue.ticketIds.forEach((ticketId) => {
      const ticket = ticketsById[ticketId];

      if (ticket && ticket.isActive()) {
        ticket.index = index;
        rows.push(ticket);
        index += 1;
      }

      if (queue.isCutoff() && (ticketId === queue.cutoffAfter)) {
        rows.push({
          isCutoffMarker: true,
        });
      }
    });

    return rows;
  },
});
