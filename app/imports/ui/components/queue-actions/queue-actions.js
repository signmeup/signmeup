import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import './queue-status-dropdown/queue-status-dropdown.js';
import './queue-more-dropdown/queue-more-dropdown.js';

import './queue-actions.html';

Template.QueueActions.events({
  'click .js-show-modal-join-queue'() {
    if (this.queue.requireLogin() && !Meteor.user()) {
      Meteor.loginWithSaml(() => {
        if (Meteor.user()) {
          $('.modal-join-queue').modal();
        }
      });
    } else {
      $('.modal-join-queue').modal();
    }
  },
});
