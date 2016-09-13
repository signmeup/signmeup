import { Template } from 'meteor/templating';

import '/imports/ui/components/ticket/ticket.js';

import './queue-table.html';

Template.QueueTable.helpers({
  noActiveTickets(queue) {
    return queue.activeTickets().count() === 0;
  },

  rows(queue) {
    const rows = [];

    const tickets = queue.tickets().fetch();
    tickets.forEach((ticket, i) => {
      if (ticket.isActive()) {
        ticket.index = i + 1; // eslint-disable-line no-param-reassign
        rows.push(ticket);
      }

      if (queue.isCutoff() && (ticket._id === queue.cutoffAfter)) {
        rows.push({
          isCutoffMarker: true,
        });
      }
    });

    return rows;
  },
});
