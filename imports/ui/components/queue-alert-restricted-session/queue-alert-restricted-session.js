import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Roles } from 'meteor/alanning:roles';

import { RestrictedSessions } from '/imports/lib/client/restricted-sessions.js';

import './device-card/device-card.js';

import './queue-alert-restricted-session.html';

Template.QueueAlertRestrictedSession.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('sessions.byQueueId', Template.currentData().queue._id);
  });
});

Template.QueueAlertRestrictedSession.helpers({
  showAddDeviceCard(queue) {
    const taOrAbove = Roles.userIsInRole(Meteor.userId(), ['admin', 'mta', 'hta', 'ta'], queue.courseId); // eslint-disable-line max-len
    return taOrAbove && !RestrictedSessions.isRestrictedToDevice(queue);
  },
});

Template.QueueAlertRestrictedSession.events({
  'click .js-add-device'(event) {
    event.preventDefault();
    RestrictedSessions.restrictToDevice(this.queue);
  },
});
