import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import {
  svgPatternUrl,
  ticketCount,
  scheduledEndTime }
from '/imports/ui/components/queue-card/queue-card.js';

import './queue-header.html';

Template.QueueHeader.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('courses.byId', Template.currentData().queue.courseId);
    this.subscribe('locations.byId', Template.currentData().queue.locationId);
    this.subscribe('users.onlineStaffByCourseId', Template.currentData().queue.courseId);
  });
});

Template.QueueHeader.helpers({
  svgPatternUrl,
  ticketCount,
  scheduledEndTime,

  onlineStaff() {
    return Meteor.users.find({
      'status.online': true,
    });
  },
});

Template.QueueHeader.events({
  'click .js-show-modal-queue-edit'() {
    $('.modal-queue-edit').modal();
  },
});
