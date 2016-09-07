import { Template } from 'meteor/templating';

import '/imports/ui/components/ticket/ticket.js';

import './queue-table.html';

Template.QueueTable.helpers({
  activeTicketsAvailable(queue) {
    return queue.activeTickets().count() > 0;
  },

  activeTicketsWithIndexes(queue) {
    const activeTickets = queue.activeTickets().fetch();
    activeTickets.forEach((ticket, i) => {
      ticket.index = i + 1; // eslint-disable-line no-param-reassign
    });

    return activeTickets;
  },
});
