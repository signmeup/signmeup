import { Template } from 'meteor/templating';

import './queue-devices.html';

Template.QueueDevices.onCreated(function onCreated() {
  this.autorun(() => {
    this.subscribe('sessions.byQueueId', Template.currentData().queue._id);
  });
});
