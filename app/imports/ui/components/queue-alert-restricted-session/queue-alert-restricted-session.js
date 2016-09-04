import { Template } from 'meteor/templating';

import './queue-alert-restricted-session.html';

Template.QueueAlertRestrictedSession.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('sessions.byQueueId', Template.currentData().queue._id);
  });
});
