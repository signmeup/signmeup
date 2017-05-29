import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import $ from 'jquery';

import '/imports/ui/components/ticket/ticket';
import { moveTicket } from '/imports/api/queues/methods';
import './queue-table.html';

Template.QueueTable.onCreated(function onCreated() {
  this.getQueueId = () => { return FlowRouter.getParam('queueId'); };
});

Template.QueueTable.onRendered(function onRendered() {
  let startInd = 0;
  $('.tbody').sortable({
    handle: '.handle',
    axis: 'y',
    cursor: 'ns-resize',
    containment: '.custom-table',
    sort: (e, ui) => {
      if (ui.position.top < ui.originalPosition.top) {
        return false;
      }
      return true;
    },
    start: (e, ui) => {
      startInd = ui.item.index();
    },
    stop: (e, ui) => {
      if (startInd !== ui.item.index()) {
        if (!confirm('Are you sure you want to move down the queue? Once you move down, you can\'t move back up.')) {
          return false;
        }
        const ticketId = $('.handle').parent().parent().attr('id');
        const newInd = ui.item.index();
        moveTicket.call({
          queueId: this.getQueueId(),
          ticketId: ticketId,
          newInd: newInd });
      }
      return true;
    },
  });
});

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
