import { Template } from 'meteor/templating';

import { RestrictedSessions } from '/imports/lib/client/restricted-sessions';

import { shuffleQueue } from '/imports/api/queues/methods';
import { deleteTicket } from '/imports/api/tickets/methods';

import './queue-more-dropdown.html';

Template.QueueMoreDropdown.onRendered(function onRendered() {
  this.$('[data-toggle="tooltip"]').tooltip();
});

Template.QueueMoreDropdown.events({
  'click .js-restrict-signups'(event) {
    event.preventDefault();
    RestrictedSessions.restrictToDevice(this.queue);
  },

  'click .js-shuffle-tickets'(event) {
    event.preventDefault();

    if (this.queue.isCutoff()) {
      alert('Sorry, cutoff queues cannot be shuffled. Resume the queue to proceed.');
      return;
    }

    const sure = prompt('Are you sure you want to shuffle all tickets? If yes, type \'SHUFFLE\' in the input below.');
    if (sure === 'SHUFFLE') {
      shuffleQueue.call({
        queueId: this.queue._id,
      }, (err) => {
        if (err) console.log(err);
      });
    }
  },

  'click .js-delete-all-tickets'(event) {
    event.preventDefault();

    const sure = prompt('Are you sure you want to delete all tickets? If yes, type \'DELETE-ALL\' in the input below.');
    if (sure === 'DELETE-ALL') {
      this.queue.activeTicketIds().forEach((ticketId) => {
        deleteTicket.call({
          ticketId: ticketId,
        }, (err) => {
          if (err) console.log(err);
        });
      });
    }
  },
});
