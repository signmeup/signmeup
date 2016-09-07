import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

import { Queues } from '/imports/api/queues/queues';

import '/imports/ui/components/queueCard/queueCard';
import '/imports/ui/components/queueList/queueList';
import '/imports/ui/components/modals/editQueueModal/editQueueModal';
import '/imports/ui/components/modals/joinQueueModal/joinQueueModal';

import './queue.html';

Template.queue.onCreated(function queueOnCreated() {
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
