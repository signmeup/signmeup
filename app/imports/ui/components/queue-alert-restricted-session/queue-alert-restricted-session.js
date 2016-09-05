import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Random } from 'meteor/random';

import { restrictSignups } from '/imports/api/queues/methods.js';

import './device-card/device-card.js';

import './queue-alert-restricted-session.html';

Template.QueueAlertRestrictedSession.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('sessions.byQueueId', Template.currentData().queue._id);
  });
});

export function isRestrictedToSession(queue, sessionId) {
  const restrictedSessionSecrets = Session.get('restrictedSessionSecrets') || {};
  return (sessionId in restrictedSessionSecrets);
}

export function isRestrictedToDevice(queue) {
  const restrictedSessionSecrets = Session.get('restrictedSessionSecrets') || {};
  return queue.settings.restrictedSessionIds.some((sessionId) => {
    return (sessionId in restrictedSessionSecrets);
  });
}

Template.QueueAlertRestrictedSession.helpers({
  showAddDeviceCard(queue) {
    return !isRestrictedToDevice(queue);
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
      const restrictedSessionSecrets = Session.get('restrictedSessionSecrets') || {};
      restrictedSessionSecrets[sessionId] = secret;
      Session.setPersistent('restrictedSessionSecrets', restrictedSessionSecrets);
    }
  });
}

Template.QueueAlertRestrictedSession.events({
  'click .js-add-device'(event) {
    event.preventDefault();
    restrictToDevice(this.queue);
  },
});
