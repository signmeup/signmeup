import { Template } from 'meteor/templating';

import '/imports/ui/components/ticket/ticket.js';

import './queue-table.html';

Template.QueueTable.helpers({
  noActiveTickets(queue) {
    return queue.activeTickets().length === 0;
  },

  rows(queue) {
    let index = 1;
    const rows = [];

    queue.tickets().forEach((ticket) => {
      if (ticket.isActive()) {
        ticket.index = index; // eslint-disable-line no-param-reassign
        rows.push(ticket);
        index += 1;
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
