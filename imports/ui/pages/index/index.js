import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { sortedActiveQueues, recentlyEndedQueues } from '/imports/api/queues/helpers';

import moment from 'moment';

import '/imports/ui/components/queue-card/queue-card';
import '/imports/ui/components/modals/modal-queue-create/modal-queue-create';

import './index.html';

Template.Index.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('courses.all');
    this.subscribe('locations.active');
    this.subscribe('queues.active');
    this.subscribe('queues.recentlyEnded');
  });
});

Template.Index.onRendered(() => {
  document.title = 'SignMeUp';

});

Template.Index.helpers({
  sortedActiveQueues() {
    return sortedActiveQueues();
  },

  recentlyEndedQueues() {
    return recentlyEndedQueues();
  },

  queuesLength() {
    return sortedActiveQueues().length + recentlyEndedQueues().length;
  },

  isTA(user) {
    if (!user) return false;
    return user.courses().count() > 0;
  },
});

Template.Index.events({
  'click .js-show-modal-queue-create'(event) {
    event.preventDefault();
    $('.modal-queue-create').modal();
  },
});
