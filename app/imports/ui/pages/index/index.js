import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import '/imports/ui/components/queue-card/queue-card.js';
import '/imports/ui/components/modals/modal-queue-create/modal-queue-create.js';

import './index.html';

Template.Index.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('courses.all');
    this.subscribe('locations.all');
    this.subscribe('queues.active');
  });
});

Template.Index.onRendered(() => {
  document.title = 'SignMeUp';
});

Template.Index.events({
  'click .js-show-modal-queue-create'(event) {
    event.preventDefault();
    $('.modal-queue-create').modal();
  },
});
