import { Template } from 'meteor/templating';

import { RestrictedSessions } from '/imports/lib/client/restricted-sessions.js';

import './queue-more-dropdown.html';

Template.QueueMoreDropdown.events({
  'click .js-restrict-signups'(event) {
    event.preventDefault();
    RestrictedSessions.restrictToDevice(this.queue);
  },
});
