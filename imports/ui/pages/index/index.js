import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import { Queues } from '/imports/api/queues/queues.js';

import '/imports/ui/components/queue-card/queue-card.js';
import '/imports/ui/components/modals/modal-queue-create/modal-queue-create.js';

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

function activeQueues() {
  const queues = Queues.find({ status: { $in: ['open', 'cutoff'] } }).fetch();
  return queues.sort((a, b) => {
    const courseA = a.course().name;
    const courseB = b.course().name;
    return courseA.localeCompare(courseB);
  });
}

Template.Index.helpers({
  activeQueues() {
    return activeQueues();
  },

  activeQueuesLength() {
    return activeQueues().length;
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
