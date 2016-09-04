import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import './queue-status-dropdown/queue-status-dropdown.js';
import './queue-more-dropdown/queue-more-dropdown.js';

import './queue-actions.html';

Template.QueueActions.events({
  'click .js-show-modal-join-queue'() {
    $('.modal-join-queue').modal();
  },
});
