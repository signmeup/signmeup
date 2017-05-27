import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { Queues } from '/imports/api/queues/queues';

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
  activeQueues() {
    return Queues.find({ status: { $in: ['open', 'cutoff'] } });
  },

  recentlyEndedQueues() {
    const cutoff = moment().subtract(5, 'minutes').toDate();
    return Queues.find({ status: 'ended', endedAt: { $gt: cutoff } });
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
