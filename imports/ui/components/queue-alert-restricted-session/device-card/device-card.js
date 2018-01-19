import { Template } from 'meteor/templating';

import uaParser from 'ua-parser-js';

import { Queues } from '/imports/api/queues/queues';

import { releaseFromSession } from '/imports/api/queues/methods';

import { RestrictedSessions } from '/imports/lib/client/restricted-sessions';

import './device-card.html';

Template.DeviceCard.onCreated(function onCreated() {
  this.autorun(() => {
    const session = Template.currentData().session;
    const queue = Queues.findOne(session.queueId);
    this.subscribe('users.byIds', {
      userIds: [session.userId],
      courseId: queue.courseId,
    });
  });
});

Template.DeviceCard.helpers({
  currentDeviceClass(session) {
    const queue = Queues.findOne(session.queueId);
    return RestrictedSessions.isSessionForCurrentDevice(queue, session._id) ? 'current-device-card' : ''; // eslint-disable-line max-len
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

Template.DeviceCard.events({
  'click .js-release-session'() {
    releaseFromSession.call({
      queueId: this.session.queueId,
      sessionId: this.session._id,
    }, (err) => {
      if (err) console.error(err);
    });
  },
});
