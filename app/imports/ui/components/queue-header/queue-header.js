import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import {
  svgPatternUrl,
  ticketCount,
  scheduledEndTime }
from '/imports/ui/components/queue-card/queue-card.js';

import '/imports/ui/components/profile-pic/profile-pic.js';

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
    const staff = Meteor.users.find({
      'status.online': true,
    }).fetch();

    const online = [];
    const idle = [];
    staff.forEach((user) => {
      if (user.status.idle) {
        idle.push(user);
      } else {
        online.push(user);
      }
    });

    return online.concat(idle);
  },
});

Template.QueueHeader.events({
  'click .js-show-modal-queue-edit'() {
    $('.modal-queue-edit').modal();
  },
});
