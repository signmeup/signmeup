import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { Queues } from '/imports/api/queues/queues';

import '/imports/ui/components/queue-card/queue-card';
import '/imports/ui/components/modals/modal-queue-create/modal-queue-create';

import './index.html';

Template.Index.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('courses.all');
    this.subscribe('locations.active');
    this.subscribe('queues.active');
  });
});

Template.Index.onRendered(() => {
  document.title = 'SignMeUp';
});

Template.Index.helpers({
  activeQueues() {
    return Queues.find({ status: { $in: ['open', 'cutoff'] } });
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
