import { Template } from 'meteor/templating';

import { restrictToDevice } from
  '/imports/ui/components/queue-alert-restricted-session/queue-alert-restricted-session.js';

import './queue-more-dropdown.html';

Template.QueueMoreDropdown.events({
  'click .js-restrict-signups'(event) {
    event.preventDefault();
    restrictToDevice(this.queue);
  },
});
