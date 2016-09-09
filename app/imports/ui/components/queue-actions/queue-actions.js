import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { isRestrictedToDevice } from
  '/imports/ui/components/queue-alert-restricted-session/queue-alert-restricted-session.js';

import './queue-status-dropdown/queue-status-dropdown.js';
import './queue-more-dropdown/queue-more-dropdown.js';

import './queue-actions.html';

Template.QueueActions.onRendered(() => {
  $('.js-announcements-tooltip-wrapper').tooltip();
});

Template.QueueActions.helpers({
  disableJoinQueue(queue) {
    const isDisabled = queue.isEnded() ||
                       (queue.isRestricted() && !isRestrictedToDevice(queue)) ||
                       (queue.hasActiveTicketWithUser(Meteor.userId()));
    return isDisabled;
  },
});

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
