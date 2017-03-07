import { Template } from 'meteor/templating';

import { openQueue, cutoffQueue, endQueue, reopenQueue } from '/imports/api/queues/methods.js';

import './queue-status-dropdown.html';

Template.QueueStatusDropdown.events({
  'click .js-open-queue'(event) {
    event.preventDefault();

    openQueue.call({
      queueId: this.queue._id,
    }, (err) => {
      if (err) console.log(err);
    });
  },

  'click .js-cutoff-queue'(event) {
    event.preventDefault();

    cutoffQueue.call({
      queueId: this.queue._id,
    }, (err) => {
      if (err) console.log(err);
    });
  },

  'click .js-end-queue'(event) {
    event.preventDefault();

    const ok = confirm('Are you sure you want to end this queue?');
    if (!ok) return;

    endQueue.call({
      queueId: this.queue._id,
    }, (err) => {
      if (err) console.log(err);
    });
  },

  'click .js-reopen-queue'(event) {
    event.preventDefault();

    reopenQueue.call({
      queueId: this.queue._id,
    }, (err) => {
      if (err) console.log(err);
    });
  },
});
