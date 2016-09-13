import { Template } from 'meteor/templating';

import { RestrictedSessions } from '/imports/lib/client/restricted-sessions.js';

import './queue-more-dropdown.html';

Template.QueueMoreDropdown.onRendered(function onRendered() {
  this.$('[data-toggle="tooltip"]').tooltip();
});

Template.QueueMoreDropdown.events({
  'click .js-restrict-signups'(event) {
    event.preventDefault();
    RestrictedSessions.restrictToDevice(this.queue);
  },
});
