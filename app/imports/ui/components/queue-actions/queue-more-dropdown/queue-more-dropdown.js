import { Template } from 'meteor/templating';
import { Random } from 'meteor/random';

import { restrictSignups } from '/imports/api/queues/methods.js';

import './queue-more-dropdown.html';

Template.QueueMoreDropdown.events({
  'click .js-restrict-signups'(event) {
    event.preventDefault();
    const secret = Random.id();
    restrictSignups.call({
      queueId: this.queue._id,
      name: 'Test Computer',
      userAgent: navigator.userAgent,
      secret,
    });
  },
});
