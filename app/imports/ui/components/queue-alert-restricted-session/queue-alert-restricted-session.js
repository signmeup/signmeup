import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';
import { Roles } from 'meteor/alanning:roles';
import { _ } from 'meteor/underscore';

import { restrictSignups } from '/imports/api/queues/methods.js';

import './device-card/device-card.js';

import './queue-alert-restricted-session.html';

Template.QueueAlertRestrictedSession.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('sessions.byQueueId', Template.currentData().queue._id);
  });
});

export function getCurrentSession(queue) {
  const restrictedSessions = Session.get('restrictedSessions') || {};
  return restrictedSessions[queue._id] || {};
}

export function isSessionForCurrentDevice(queue, sessionId) {
  const currentSession = getCurrentSession(queue);
  return (currentSession.sessionId === sessionId);
}

export function isRestrictedToDevice(queue) {
  const restrictedSessions = Session.get('restrictedSessions') || {};
  const sessionId = restrictedSessions[queue._id] && restrictedSessions[queue._id].sessionId;
  return _.contains(queue.settings.restrictedSessionIds, sessionId);
}

Template.QueueAlertRestrictedSession.helpers({
  showAddDeviceCard(queue) {
    const taOrAbove = Roles.userIsInRole(Meteor.userId(), ['admin', 'mta', 'hta', 'ta'], queue.courseId); // eslint-disable-line max-len
    return taOrAbove && !isRestrictedToDevice(queue);
  },
});

export function restrictToDevice(queue) {
  const secret = Random.id();
  restrictSignups.call({
    queueId: queue._id,
    name: queue.location().name,
    userAgent: navigator.userAgent,
    secret,
  }, (err, sessionId) => {
    if (!err) {
      const restrictedSessions = Session.get('restrictedSessions') || {};
      restrictedSessions[queue._id] = { sessionId, secret };
      Session.setPersistent('restrictedSessions', restrictedSessions);
    }
  });
}

Template.QueueAlertRestrictedSession.events({
  'click .js-add-device'(event) {
    event.preventDefault();
    restrictToDevice(this.queue);
  },
});
