import { Template } from 'meteor/templating';

import uaParser from 'ua-parser-js';

import Queues from '/imports/api/queues/queues.js';

import { isRestrictedToSession } from
  '/imports/ui/components/queue-alert-restricted-session/queue-alert-restricted-session.js';

import './device-card.html';

Template.DeviceCard.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('users.byId', Template.currentData().session.userId);
  });
});

Template.DeviceCard.helpers({
  currentDeviceClass(session) {
    const queue = Queues.findOne(session.queueId);
    return isRestrictedToSession(queue, session._id) ? 'current-device-card' : '';
  },

  icon(userAgent) {
    const ua = uaParser(userAgent);
    if (['iOS', 'Android', 'Windows Phone'].indexOf(ua.os.name) !== -1) {
      return 'phone_iphone';
    }

    return 'laptop_chromebook';
  },

  formattedUserAgent(userAgent) {
    const ua = uaParser(userAgent);
    return `${ua.browser.name} on ${ua.os.name}`;
  },
});
