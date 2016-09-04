import { Template } from 'meteor/templating';

import '/imports/ui/components/ticket/ticket.js';

import './queue-table.html';

Template.QueueTable.helpers({
  activeTicketsAvailable(queue) {
    return queue.activeTickets().count() > 0;
  },
});
