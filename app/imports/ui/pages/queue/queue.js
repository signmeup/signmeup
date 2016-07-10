import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import Queues from '/imports/api/queues/queues';

import './queue.html';

Template.queue.onCreated(() => {
  const self = this;
  self.autorun(() => {
    const queueId = FlowRouter.getParam('queueId');
    self.subscribe('queue', queueId);
    self.subscribe('allQueueTickets', queueId);
    self.subscribe('courses');
  });
});

Template.queue.helpers({
  queue() {
    const queueId = FlowRouter.getParam('queueId');
    return Queues.findOne({ _id: queueId });
  },
});
